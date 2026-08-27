export type Recipe = {
  slug: string;
  title: string;
  tag: "lunch" | "dinner" | "breakfast";
  tagLabel: string;
  time: string;
  image: string;
  excerpt: string;
  ingredients: string[];
  steps: string[];
  productSlug?: string; // link to meat
};

export const recipes: Recipe[] = [
  {
    slug: "tsooiwan",
    title: "Үхрийн цул цуйван",
    tag: "lunch",
    tagLabel: "Өдрийн хоол",
    time: "35 мин",
    image: "https://cdn.cody.mn/img/374658/800x800xwebp/grill_havirga_recipe.jpg?h=68a1552c6cee946ddb562118a9a0d9e5d72dd113",
    excerpt: "Гурилтай хутгасан цуйван, үхрийн цул махаар хийсэн Монгол амт.",
    ingredients: ["Үхрийн цул 500г", "Гурил 400г", "Сонгино 2ш", "Давс, перец"],
    steps: ["Махаа нимгэн хэрчиж шарна.", "Гоймонгоо чанаж, махан дээр нэмнэ.", "Амтлаад 5 минут жигнэнэ."],
    productSlug: "uher-tsul-mah",
  },
  {
    slug: "perfect-steak",
    title: "The Perfect Steak — гэрийн аргаар",
    tag: "dinner",
    tagLabel: "Оройн зоог",
    time: "20 мин",
    image: "https://cdn.cody.mn/img/392007/800x800xwebp/perfect_steak.jpg?h=68a1552c6cee946ddb562118a9a0d9e5d72dd113",
    excerpt: "Шарсан стейкийг гэрийн хайруулын тавган дээр хийх заавар.",
    ingredients: ["Үхрийн цул 400г", "Цөцгийн тос 30г", "Сармис, розмарин"],
    steps: ["Махаа өрөөний хэмд байлгана.", "Хайруулын тавгаа халаагаад махаа 3-4 минут шарна.", "Цөцгийн тос, ургамлаар амтална."],
    productSlug: "uher-tsul-mah",
  },
  {
    slug: "buuz",
    title: "Хонины банш — уламжлалт",
    tag: "dinner",
    tagLabel: "Оройн зоог",
    time: "50 мин",
    image: "https://cdn.cody.mn/img/417907/800x800xwebp/bansh.jpg?h=68a1552c6cee946ddb562118a9a0d9e5d72dd113",
    excerpt: "Хонины цул, сонгинотой шүүслэг банш.",
    ingredients: ["Хонины цул 600г", "Гурил 500г", "Сонгино 3ш"],
    steps: ["Махаа жижиг хэрчинэ.", "Гурилаар баншаа орооно.", "Жигнүүр дээр 15 минут жигнэнэ."],
    productSlug: "khon-tsul-mah",
  },
  {
    slug: "grill-khavirga",
    title: "Грилл хавирга",
    tag: "dinner",
    tagLabel: "Оройн зоог",
    time: "45 мин",
    image: "https://cdn.cody.mn/img/374658/800x800xwebp/grill_havirga_recipe.jpg?h=68a1552c6cee946ddb562118a9a0d9e5d72dd113",
    excerpt: "Зууханд шарсан хавирга — амтлаг соустай.",
    ingredients: ["Үхрийн хавирга 800г", "Соус, давс, перец"],
    steps: ["Хавиргаа амталж 30 минут дарна.", "180°C-д 40 минут шарна.", "Соустай хамт үйлчилнэ."],
    productSlug: "uher-khavirga",
  },
  {
    slug: "khorkhog",
    title: "Хорхог — халуун чулуугаар",
    tag: "lunch",
    tagLabel: "Өдрийн хоол",
    time: "90 мин",
    image: "https://cdn.cody.mn/img/380774/800x800xwebp/ereen_bulchin.jpg?h=68a1552c6cee946ddb562118a9a0d9e5d72dd113",
    excerpt: "Уламжлалт хорхогийг гэртээ хийх хялбар арга.",
    ingredients: ["Хонины ястай мах 1кг", "Төмс, лууван", "Халуун чулуу"],
    steps: ["Махаа давслана.", "Саванд хийж 1 цаг битүү жигнэнэ.", "Төмс нэмж хамт болгоно."],
    productSlug: "khon-yastai-mah",
  },
  {
    slug: "takhia-guya",
    title: "Тахианы шарсан гуя",
    tag: "lunch",
    tagLabel: "Өдрийн хоол",
    time: "30 мин",
    image: "https://cdn.cody.mn/img/400x400xwebp/perfect_steak.jpg?h=68a1552c6cee946ddb562118a9a0d9e5d72dd113",
    excerpt: "Шүүслэг тахианы гуя — хүүхдүүдийн дуртай.",
    ingredients: ["Тахианы гуя 600г", "Тахианы амтлагч", "Тос"],
    steps: ["Гуйгаа амтална.", "Шарсан тавган дээр шарна.", "Салаттай хамт гаргана."],
    productSlug: "takhia-guya",
  },
];
