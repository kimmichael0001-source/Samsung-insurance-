-- CODE (Brand Code) — схема базы данных Supabase.
--
-- Как применить:
--   1. Откройте ваш проект на supabase.com -> SQL Editor -> New query.
--   2. Вставьте и выполните содержимое этого файла.
--   3. Затем выполните supabase/seed.sql, чтобы загрузить демо-каталог,
--      сток по размерам (product_variants) и справочник доставки
--      (shipping_destinations).
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
-- product_variants — сток по размерам. Один ряд на товар+размер.
-- Это отдельный источник истины по наличию (в отличие от products.available_sizes,
-- который остаётся простым списком «в каких размерах вообще бывает товар» для
-- отображения в карточке). Для каждого размера товара нужно завести здесь ряд —
-- иначе оформить заказ на этот размер будет нельзя (см. триггер списания стока
-- ниже). Управляется через Table Editor — см. README, раздел «Управление
-- каталогом без кода».
-- ============================================================
create table if not exists public.product_variants (
  product_id text not null references public.products (id) on delete cascade,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  primary key (product_id, size)
);

create index if not exists product_variants_product_id_idx on public.product_variants (product_id);

alter table public.product_variants enable row level security;

drop policy if exists "Variants are publicly readable" on public.product_variants;
create policy "Variants are publicly readable"
  on public.product_variants for select
  using (true);

-- ============================================================
-- shipping_destinations — справочник направлений доставки из Кореи.
-- Публично читаемый, пишет только оператор (Table Editor).
-- ============================================================
create table if not exists public.shipping_destinations (
  country_code text primary key,
  country_name text not null,
  cost integer not null check (cost >= 0),
  currency text not null default '₸',
  eta_min_days integer not null check (eta_min_days > 0),
  eta_max_days integer not null check (eta_max_days >= eta_min_days),
  customs_note text not null default '',
  is_active boolean not null default true
);

alter table public.shipping_destinations enable row level security;

drop policy if exists "Shipping destinations are publicly readable" on public.shipping_destinations;
create policy "Shipping destinations are publicly readable"
  on public.shipping_destinations for select
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
-- orders — заявки на покупку. Каждый ряд — одна единица товара одного размера
-- (корзина с quantity > 1 при оформлении создаёт несколько рядов).
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
  -- Снимок доставки на момент оформления (страна могла позже измениться
  -- в справочнике shipping_destinations — на уже созданный заказ это не влияет).
  shipping_country text references public.shipping_destinations (country_code),
  shipping_cost integer not null default 0 check (shipping_cost >= 0),
  estimated_delivery_min_days integer,
  estimated_delivery_max_days integer,
  tracking_number text,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- На случай повторного запуска поверх уже созданной таблицы старой версии схемы.
alter table public.orders add column if not exists shipping_country text references public.shipping_destinations (country_code);
alter table public.orders add column if not exists shipping_cost integer not null default 0;
alter table public.orders add column if not exists estimated_delivery_min_days integer;
alter table public.orders add column if not exists estimated_delivery_max_days integer;
alter table public.orders add column if not exists tracking_number text;

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

-- Списывает сток размера при создании заказа. Требует, чтобы для товара и
-- размера существовал ряд в product_variants со stock > 0 — иначе заказ
-- не создастся (это и есть защита от продажи товара, которого нет в наличии).
create or replace function public.decrement_variant_stock()
returns trigger
language plpgsql
as $$
begin
  update public.product_variants
  set stock = stock - 1
  where product_id = new.product_id
    and size = new.size
    and stock > 0;

  if not found then
    raise exception 'Размер % товара % закончился или не заведён в product_variants', new.size, new.product_id;
  end if;

  return new;
end;
$$;

drop trigger if exists orders_decrement_variant_stock on public.orders;
create trigger orders_decrement_variant_stock
  before insert on public.orders
  for each row execute function public.decrement_variant_stock();

alter table public.orders enable row level security;

-- Клиент может только создавать свои заказы и читать их — менять статус,
-- трек-номер и т.д. может только оператор из Table Editor (сервисная роль
-- обходит RLS). Полноценный кабинет байера с отдельной ролью — этап 4.
drop policy if exists "Users manage their own orders" on public.orders;
drop policy if exists "Users can view their own orders" on public.orders;
drop policy if exists "Users can create their own orders" on public.orders;

create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);
