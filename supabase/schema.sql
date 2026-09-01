-- CODE (Brand Code) — схема базы данных Supabase.
--
-- Как применить:
--   1. Откройте ваш проект на supabase.com -> SQL Editor -> New query.
--   2. Вставьте и выполните содержимое этого файла.
--   3. Затем выполните supabase/seed.sql, чтобы загрузить демо-каталог.
--   4. В Authentication -> Providers включите "Anonymous Sign-Ins"
--      (приложение использует анонимные сессии для избранного/корзины/заказов,
--      пока не подключена настоящая авторизация — см. этап 3 в PROJECT_PLAN.md).
--
-- Таблицы полностью зеркалят TypeScript-типы в src/types, поэтому маппинг
-- в src/services/* — это просто snake_case <-> camelCase.

-- ============================================================
-- products — каталог товаров. Публично читаемый, пишет только байер/админ
-- (кабинет байера и админ-панель — будущие этапы 4 и 5).
-- ============================================================
create table if not exists public.products (
  id text primary key,
  brand text not null,
  title text not null,
  description text not null,
  category text not null check (category in ('clothing', 'shoes', 'bags', 'accessories')),
  images text[] not null default '{}',
  original_price integer not null check (original_price >= 0),
  sale_price integer not null check (sale_price >= 0),
  discount_percent integer not null check (discount_percent between 0 and 100),
  currency text not null default '₸',
  available_sizes text[] not null default '{}',
  condition text not null check (condition in ('new', 'like_new', 'excellent')),
  outlet_name text not null,
  location text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  is_available boolean not null default true,
  is_featured boolean not null default false
);

alter table public.products enable row level security;

drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable"
  on public.products for select
  using (true);

-- ============================================================
-- favorites — избранные товары, по одному ряду на пользователя и товар.
-- ============================================================
create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists favorites_user_id_idx on public.favorites (user_id);

alter table public.favorites enable row level security;

drop policy if exists "Users manage their own favorites" on public.favorites;
create policy "Users manage their own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- cart_items — содержимое корзины. id формируется в приложении как
-- "<productId>__<size>", уникален в рамках пользователя.
-- ============================================================
create table if not exists public.cart_items (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  brand text not null,
  title text not null,
  image text not null,
  size text not null,
  price integer not null check (price >= 0),
  currency text not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.cart_items enable row level security;

drop policy if exists "Users manage their own cart" on public.cart_items;
create policy "Users manage their own cart"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- orders — заявки на покупку. Пока нет кабинета байера (этап 4), покупатель
-- может создавать свои заявки; смену статуса вручную оставляем доступной
-- здесь же для демонстрации — в реальном продукте update будет только
-- у роли байера/админа.
-- ============================================================
create sequence if not exists public.order_number_seq start with 10300;

create table if not exists public.orders (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_number text not null default '',
  product_id text not null references public.products (id),
  product_title text not null,
  product_brand text not null,
  product_image text not null,
  size text not null,
  price integer not null check (price >= 0),
  currency text not null,
  status text not null default 'pending_confirmation' check (
    status in (
      'pending_confirmation', 'purchased', 'in_stock_korea',
      'in_transit', 'ready_for_pickup', 'cancelled', 'out_of_stock'
    )
  ),
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists orders_user_id_created_at_idx on public.orders (user_id, created_at desc);

create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'CODE-' || nextval('public.order_number_seq');
  end if;
  return new;
end;
$$;

drop trigger if exists orders_set_order_number on public.orders;
create trigger orders_set_order_number
  before insert on public.orders
  for each row execute function public.set_order_number();

alter table public.orders enable row level security;

drop policy if exists "Users manage their own orders" on public.orders;
create policy "Users manage their own orders"
  on public.orders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
