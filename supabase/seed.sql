-- CODE (Brand Code) — демо-каталог из 14 товаров.
-- Выполняется после supabase/schema.sql. Идемпотентен (ON CONFLICT DO UPDATE),
-- можно перезапускать. Даты created_at/expires_at заданы относительно
-- момента запуска скрипта — так же, как в локальном фолбэке src/data/products.ts.

insert into public.products
  (id, brand, title, description, category, images, original_price, sale_price,
   discount_percent, currency, available_sizes, condition, outlet_name, location,
   created_at, expires_at, is_available, is_featured)
values
  ('p001', 'Lacoste', 'Поло классическое пике',
   'Оригинальное поло Lacoste из фирменной ткани пике. Свободный крой, вышитый логотип крокодила на груди. Найдено в аутлете Yeoju Premium.',
   'clothing',
   array['https://picsum.photos/seed/code-p001-a/900/1200', 'https://picsum.photos/seed/code-p001-b/900/1200', 'https://picsum.photos/seed/code-p001-c/900/1200'],
   45000, 27000, 40, '₸', array['S', 'M', 'L', 'XL'], 'new', 'Yeoju Premium Outlet', 'Ёджу, Южная Корея',
   now() - interval '1 day', now() + interval '18 hours', true, true),

  ('p002', 'Tommy Hilfiger', 'Куртка-бомбер утеплённая',
   'Демисезонный бомбер с фирменной нашивкой на рукаве. Плотная подкладка, удобные карманы на молнии. Отличный вариант на прохладную погоду.',
   'clothing',
   array['https://picsum.photos/seed/code-p002-a/900/1200', 'https://picsum.photos/seed/code-p002-b/900/1200', 'https://picsum.photos/seed/code-p002-c/900/1200'],
   98000, 58000, 41, '₸', array['M', 'L', 'XL', 'XXL'], 'new', 'Paju Premium Outlet', 'Пхаджу, Южная Корея',
   now() - interval '2 days', now() + interval '30 hours', true, true),

  ('p003', 'Ralph Lauren', 'Рубашка оксфорд слим',
   'Хлопковая рубашка оксфорд с вышитым пони. Приталенный силуэт, подходит и для офиса, и для повседневной носки.',
   'clothing',
   array['https://picsum.photos/seed/code-p003-a/900/1200', 'https://picsum.photos/seed/code-p003-b/900/1200', 'https://picsum.photos/seed/code-p003-c/900/1200'],
   62000, 37000, 40, '₸', array['S', 'M', 'L'], 'like_new', 'Yeoju Premium Outlet', 'Ёджу, Южная Корея',
   now() - interval '3 days', now() + interval '2 days', true, false),

  ('p004', 'Nike', 'Кроссовки Air Max',
   'Беговые кроссовки с амортизирующей подошвой Air Max. Дышащий верх, устойчивая посадка стопы. Найдены новыми, в коробке.',
   'shoes',
   array['https://picsum.photos/seed/code-p004-a/900/1200', 'https://picsum.photos/seed/code-p004-b/900/1200', 'https://picsum.photos/seed/code-p004-c/900/1200'],
   78000, 46000, 41, '₸', array['40', '41', '42', '43', '44'], 'new', 'Yeoju Premium Outlet', 'Ёджу, Южная Корея',
   now() - interval '1 day', now() + interval '12 hours', true, true),

  ('p005', 'Adidas', 'Кроссовки Samba OG',
   'Культовая модель Samba из замши и кожи. Классическая три-полоски, резиновая подошва gum. Универсальная пара под любой образ.',
   'shoes',
   array['https://picsum.photos/seed/code-p005-a/900/1200', 'https://picsum.photos/seed/code-p005-b/900/1200', 'https://picsum.photos/seed/code-p005-c/900/1200'],
   68000, 41000, 40, '₸', array['38', '39', '40', '41', '42', '43'], 'new', 'Busan Premium Outlet', 'Пусан, Южная Корея',
   now() - interval '4 days', now() + interval '1 day', true, false),

  ('p006', 'Polo', 'Сумка через плечо Pony Logo',
   'Компактная сумка через плечо из экокожи с вышитым логотипом-пони. Регулируемый ремень, внутренний карман на молнии.',
   'bags',
   array['https://picsum.photos/seed/code-p006-a/900/1200', 'https://picsum.photos/seed/code-p006-b/900/1200', 'https://picsum.photos/seed/code-p006-c/900/1200'],
   54000, 32000, 41, '₸', array['One size'], 'new', 'Paju Premium Outlet', 'Пхаджу, Южная Корея',
   now() - interval '2 days', now() + interval '20 hours', true, true),

  ('p007', 'Ralph Lauren', 'Рюкзак городской',
   'Прочный рюкзак для города с отделением для ноутбука 15". Вышитый логотип пони, водоотталкивающая ткань.',
   'bags',
   array['https://picsum.photos/seed/code-p007-a/900/1200', 'https://picsum.photos/seed/code-p007-b/900/1200', 'https://picsum.photos/seed/code-p007-c/900/1200'],
   71000, 44000, 38, '₸', array['One size'], 'excellent', 'Yeoju Premium Outlet', 'Ёджу, Южная Корея',
   now() - interval '5 days', now() + interval '3 days', true, false),

  ('p008', 'Tommy Hilfiger', 'Кепка с вышитым флагом',
   'Классическая бейсболка с вышитым логотипом-флагом. Регулируемый ремешок, подходит под любой размер головы.',
   'accessories',
   array['https://picsum.photos/seed/code-p008-a/900/1200', 'https://picsum.photos/seed/code-p008-b/900/1200', 'https://picsum.photos/seed/code-p008-c/900/1200'],
   22000, 13000, 41, '₸', array['One size'], 'new', 'Busan Premium Outlet', 'Пусан, Южная Корея',
   now() - interval '1 day', now() + interval '15 hours', true, false),

  ('p009', 'Nike', 'Ремень кожаный с пряжкой-свуш',
   'Натуральная кожа, металлическая пряжка с фирменным знаком. Универсальная длина с возможностью подгонки.',
   'accessories',
   array['https://picsum.photos/seed/code-p009-a/900/1200', 'https://picsum.photos/seed/code-p009-b/900/1200', 'https://picsum.photos/seed/code-p009-c/900/1200'],
   26000, 15500, 40, '₸', array['One size'], 'new', 'Yeoju Premium Outlet', 'Ёджу, Южная Корея',
   now() - interval '3 days', now() + interval '2 days', true, false),

  ('p010', 'Adidas', 'Спортивный костюм Track',
   'Комплект: олимпийка и брюки из фирменной ткани трипстрайп. Прямой крой, эластичные манжеты и пояс на резинке.',
   'clothing',
   array['https://picsum.photos/seed/code-p010-a/900/1200', 'https://picsum.photos/seed/code-p010-b/900/1200', 'https://picsum.photos/seed/code-p010-c/900/1200'],
   84000, 49000, 42, '₸', array['S', 'M', 'L', 'XL'], 'new', 'Paju Premium Outlet', 'Пхаджу, Южная Корея',
   now() - interval '1 day', now() + interval '9 hours', true, true),

  ('p011', 'New Balance', 'Кроссовки 574 замшевые',
   'Культовая модель 574 из замши и сетки. Мягкая амортизирующая подошва ENCAP, фирменная буква "N" по бокам.',
   'shoes',
   array['https://picsum.photos/seed/code-p011-a/900/1200', 'https://picsum.photos/seed/code-p011-b/900/1200', 'https://picsum.photos/seed/code-p011-c/900/1200'],
   58000, 35000, 40, '₸', array['40', '41', '42', '43', '44', '45'], 'new', 'Busan Premium Outlet', 'Пусан, Южная Корея',
   now() - interval '6 days', now() + interval '4 days', true, false),

  ('p012', 'Lacoste', 'Кроссовки кожаные низкие',
   'Минималистичные кожаные кроссовки с перфорацией-крокодилом сбоку. Лёгкая подошва, комфортная посадка.',
   'shoes',
   array['https://picsum.photos/seed/code-p012-a/900/1200', 'https://picsum.photos/seed/code-p012-b/900/1200', 'https://picsum.photos/seed/code-p012-c/900/1200'],
   64000, 38000, 41, '₸', array['40', '41', '42', '44', '45'], 'new', 'Yeoju Premium Outlet', 'Ёджу, Южная Корея',
   now() - interval '2 days', now() + interval '26 hours', false, false),

  ('p013', 'New Balance', 'Худи с вышитым логотипом',
   'Плотный флисовый худи с вышитой буквой "N" на груди. Прямой крой, мягкая начёсанная изнанка, кулиска с фиксаторами.',
   'clothing',
   array['https://picsum.photos/seed/code-p013-a/900/1200', 'https://picsum.photos/seed/code-p013-b/900/1200', 'https://picsum.photos/seed/code-p013-c/900/1200'],
   42000, 25000, 40, '₸', array['S', 'M', 'L', 'XL'], 'new', 'Paju Premium Outlet', 'Пхаджу, Южная Корея',
   now() - interval '1 day', now() + interval '22 hours', true, false),

  ('p014', 'Polo', 'Рубашка поло Pony',
   'Хлопковое поло с вышитым логотипом-пони на груди. Классическая посадка, ребристый воротник и манжеты.',
   'clothing',
   array['https://picsum.photos/seed/code-p014-a/900/1200', 'https://picsum.photos/seed/code-p014-b/900/1200', 'https://picsum.photos/seed/code-p014-c/900/1200'],
   48000, 29000, 40, '₸', array['S', 'M', 'L', 'XL'], 'new', 'Yeoju Premium Outlet', 'Ёджу, Южная Корея',
   now() - interval '2 days', now() + interval '1 day', true, true),

  ('p015', 'Nike', 'Кроссовки Dunk Low',
   'Культовая модель Dunk Low, кожа и замша. Контрастные вставки, вафельная резиновая подошва.',
   'shoes',
   array['https://picsum.photos/seed/code-p015-a/900/1200', 'https://picsum.photos/seed/code-p015-b/900/1200', 'https://picsum.photos/seed/code-p015-c/900/1200'],
   72000, 43000, 40, '₸', array['39', '40', '41', '42', '43', '44'], 'new', 'Yeoju Premium Outlet', 'Ёджу, Южная Корея',
   now() - interval '1 day', now() + interval '16 hours', true, true),

  ('p016', 'Adidas', 'Рюкзак спортивный Classic',
   'Вместительный рюкзак с отделением для ноутбука и обуви. Плотный полиэстер, водоотталкивающая пропитка.',
   'bags',
   array['https://picsum.photos/seed/code-p016-a/900/1200', 'https://picsum.photos/seed/code-p016-b/900/1200', 'https://picsum.photos/seed/code-p016-c/900/1200'],
   34000, 20000, 41, '₸', array['One size'], 'new', 'Busan Premium Outlet', 'Пусан, Южная Корея',
   now() - interval '3 days', now() + interval '2 days', true, false),

  ('p017', 'Lacoste', 'Сумка через плечо Croc',
   'Компактная сумка-планшет из плотного нейлона с кожаными вставками и вышитым крокодилом.',
   'bags',
   array['https://picsum.photos/seed/code-p017-a/900/1200', 'https://picsum.photos/seed/code-p017-b/900/1200', 'https://picsum.photos/seed/code-p017-c/900/1200'],
   46000, 28000, 39, '₸', array['One size'], 'excellent', 'Yeoju Premium Outlet', 'Ёджу, Южная Корея',
   now() - interval '4 days', now() + interval '2 days', true, false),

  ('p018', 'Tommy Hilfiger', 'Кроссовки низкие Retro',
   'Ретро-силуэт на шнуровке, комбинация кожи и текстиля, фирменный флажок на язычке.',
   'shoes',
   array['https://picsum.photos/seed/code-p018-a/900/1200', 'https://picsum.photos/seed/code-p018-b/900/1200', 'https://picsum.photos/seed/code-p018-c/900/1200'],
   56000, 33000, 41, '₸', array['40', '41', '42', '43', '44'], 'new', 'Paju Premium Outlet', 'Пхаджу, Южная Корея',
   now() - interval '2 days', now() + interval '20 hours', true, false),

  ('p019', 'Ralph Lauren', 'Свитшот Polo Bear',
   'Плотный флисовый свитшот с вышитым мишкой Polo Bear на груди. Прямой крой, рибана на манжетах.',
   'clothing',
   array['https://picsum.photos/seed/code-p019-a/900/1200', 'https://picsum.photos/seed/code-p019-b/900/1200', 'https://picsum.photos/seed/code-p019-c/900/1200'],
   64000, 38000, 41, '₸', array['S', 'M', 'L', 'XL'], 'new', 'Yeoju Premium Outlet', 'Ёджу, Южная Корея',
   now() - interval '1 day', now() + interval '28 hours', true, false),

  ('p020', 'New Balance', 'Шорты спортивные',
   'Лёгкие тканые шорты для тренировок и повседневной носки. Сетчатая подкладка, боковые карманы на молнии.',
   'clothing',
   array['https://picsum.photos/seed/code-p020-a/900/1200', 'https://picsum.photos/seed/code-p020-b/900/1200', 'https://picsum.photos/seed/code-p020-c/900/1200'],
   28000, 17000, 39, '₸', array['S', 'M', 'L', 'XL'], 'new', 'Busan Premium Outlet', 'Пусан, Южная Корея',
   now() - interval '5 days', now() + interval '3 days', true, false)

on conflict (id) do update set
  brand = excluded.brand,
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  images = excluded.images,
  original_price = excluded.original_price,
  sale_price = excluded.sale_price,
  discount_percent = excluded.discount_percent,
  currency = excluded.currency,
  available_sizes = excluded.available_sizes,
  condition = excluded.condition,
  outlet_name = excluded.outlet_name,
  location = excluded.location,
  expires_at = excluded.expires_at,
  is_available = excluded.is_available,
  is_featured = excluded.is_featured;

-- ============================================================
-- Сток по размерам. Ряд обязателен для каждого продаваемого размера —
-- без него оформить заказ на этот размер нельзя (см. schema.sql,
-- decrement_variant_stock). У p012 сток нулевой намеренно — товар помечен
-- is_available = false, демонстрирует состояние «раскуплено».
-- ============================================================
insert into public.product_variants (product_id, size, stock) values
  ('p001', 'S', 6), ('p001', 'M', 10), ('p001', 'L', 8), ('p001', 'XL', 4),
  ('p002', 'M', 5), ('p002', 'L', 9), ('p002', 'XL', 7), ('p002', 'XXL', 3),
  ('p003', 'S', 4), ('p003', 'M', 7), ('p003', 'L', 5),
  ('p004', '40', 3), ('p004', '41', 6), ('p004', '42', 8), ('p004', '43', 5), ('p004', '44', 2),
  ('p005', '38', 2), ('p005', '39', 5), ('p005', '40', 7), ('p005', '41', 6), ('p005', '42', 4), ('p005', '43', 2),
  ('p006', 'One size', 10),
  ('p007', 'One size', 6),
  ('p008', 'One size', 15),
  ('p009', 'One size', 12),
  ('p010', 'S', 5), ('p010', 'M', 8), ('p010', 'L', 6), ('p010', 'XL', 3),
  ('p011', '40', 3), ('p011', '41', 6), ('p011', '42', 8), ('p011', '43', 7), ('p011', '44', 4), ('p011', '45', 2),
  ('p012', '40', 0), ('p012', '41', 0), ('p012', '42', 0), ('p012', '44', 0), ('p012', '45', 0),
  ('p013', 'S', 6), ('p013', 'M', 9), ('p013', 'L', 7), ('p013', 'XL', 4),
  ('p014', 'S', 5), ('p014', 'M', 8), ('p014', 'L', 6), ('p014', 'XL', 3),
  ('p015', '39', 3), ('p015', '40', 6), ('p015', '41', 9), ('p015', '42', 8), ('p015', '43', 5), ('p015', '44', 2),
  ('p016', 'One size', 14),
  ('p017', 'One size', 5),
  ('p018', '40', 4), ('p018', '41', 7), ('p018', '42', 6), ('p018', '43', 3), ('p018', '44', 2),
  ('p019', 'S', 5), ('p019', 'M', 7), ('p019', 'L', 6), ('p019', 'XL', 3),
  ('p020', 'S', 9), ('p020', 'M', 12), ('p020', 'L', 10), ('p020', 'XL', 6)
on conflict (product_id, size) do update set stock = excluded.stock;

-- ============================================================
-- Справочник направлений доставки из Кореи. Стоимость и сроки — демо-оценки,
-- перед реальным запуском согласуйте с логистическим партнёром (этап 9).
-- ============================================================
insert into public.shipping_destinations
  (country_code, country_name, cost, currency, eta_min_days, eta_max_days, customs_note, is_active)
values
  ('KZ', 'Казахстан', 4900, '₸', 7, 12,
   'Для физлиц действует порог беспошлинного ввоза для товаров личного пользования (уточняйте актуальный лимит на сайте ЕЭК/КГД РК) — при превышении взимается пошлина и НДС.',
   true),
  ('RU', 'Россия', 6900, '₸', 10, 16,
   'Возможны таможенные пошлины при превышении лимита беспошлинного ввоза для физлиц — уточняйте актуальные пороги на сайте ФТС.',
   true),
  ('KG', 'Кыргызстан', 5900, '₸', 9, 15,
   'Как член ЕАЭС применяются единые пороги беспошлинного ввоза ЕАЭС для физлиц.',
   true),
  ('UZ', 'Узбекистан', 7900, '₸', 12, 18,
   'Узбекistan не входит в ЕАЭС — таможенное оформление и пошлины рассчитываются по национальному законодательству.',
   true),
  ('DE', 'Германия (пример: остальной мир)', 15900, '₸', 15, 25,
   'Пошлины и НДС страны получателя оплачиваются покупателем при получении в соответствии с местным законодательством.',
   true)
on conflict (country_code) do update set
  country_name = excluded.country_name,
  cost = excluded.cost,
  currency = excluded.currency,
  eta_min_days = excluded.eta_min_days,
  eta_max_days = excluded.eta_max_days,
  customs_note = excluded.customs_note,
  is_active = excluded.is_active;
