export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
}

export interface Category {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export const urduGrammarData: Category[] = [
  {
    id: "noun-types",
    title: "اسم اور اس کی اقسام",
    description: "اسم معرفہ، اسم نکرہ اور ان کی ذیلی اقسام",
    questions: [
      {
        id: 1,
        question: "وہ اسم جو کسی خاص شخص، جگہ یا چیز کے لیے بولا جائے، اسے کیا کہتے ہیں؟",
        options: ["اسم نکرہ", "اسم معرفہ", "اسم صفت", "اسم ذات"],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "اسم نکرہ کا دوسرا نام کیا ہے؟",
        options: ["اسم خاص", "اسم عام", "اسم ضمیر", "اسم اشارہ"],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "درج ذیل میں سے اسم معرفہ کی نشاندہی کریں:",
        options: ["پہاڑ", "دریا", "ہمالیہ", "شہر"],
        correctAnswer: 2
      },
      {
        id: 4,
        question: "\"کتاب\" قواعد کی رو سے کیا ہے؟",
        options: ["اسم معرفہ", "اسم نکرہ", "اسم علم", "اسم موصول"],
        correctAnswer: 1
      },
      {
        id: 5,
        question: "وہ نام جو حکومت کی طرف سے کسی اعزاز کے طور پر دیا جائے، اسے کیا کہتے ہیں؟",
        options: ["لقب", "خطاب", "تخلص", "کنیت"],
        correctAnswer: 1
      },
      {
        id: 6,
        question: "\"شمس العلماء\" قواعد کی رو سے کیا ہے؟",
        options: ["لقب", "خطاب", "عرف", "کنیت"],
        correctAnswer: 1
      },
      {
        id: 7,
        question: "وہ نام جو کسی خاص خوبی کی وجہ سے عوام میں مشہور ہو جائے، اسے کہتے ہیں:",
        options: ["خطاب", "لقب", "تخلص", "عرف"],
        correctAnswer: 1
      },
      {
        id: 8,
        question: "\"خلیل اللہ\" کس کی مثال ہے؟",
        options: ["خطاب", "لقب", "تخلص", "عرف"],
        correctAnswer: 1
      },
      {
        id: 9,
        question: "شاعر اپنے کلام میں جو مختصر نام استعمال کرتا ہے، اسے کیا کہتے ہیں؟",
        options: ["عرف", "لقب", "تخلص", "خطاب"],
        correctAnswer: 2
      },
      {
        id: 10,
        question: "\"غالب\" کیا ہے؟",
        options: ["لقب", "خطاب", "تخلص", "عرف"],
        correctAnswer: 2
      }
    ]
  },
  {
    id: "instrument-sound",
    title: "اسم آلہ اور اسم صوت",
    description: "اوزاروں، ہتھیاروں اور آوازوں کے نام",
    questions: [
      {
        id: 1,
        question: "وہ اسم جو کسی اوزار، ہتھیار یا آلے کا نام ہو، اسے کیا کہتے ہیں؟",
        options: ["اسم صوت", "اسم آلہ", "اسم ظرف", "اسم نکرہ"],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "وہ اسم جو کسی جاندار یا بے جان کی آواز کو ظاہر کرے، اسے کہتے ہیں:",
        options: ["اسم آلہ", "اسم مکبر", "اسم صوت", "اسم مصغر"],
        correctAnswer: 2
      },
      {
        id: 3,
        question: "درج ذیل میں سے کون سا لفظ اسم آلہ ہے؟",
        options: ["ہتھوڑا", "کائیں کائیں", "گھر", "لڑکا"],
        correctAnswer: 0
      },
      {
        id: 4,
        question: "\"میاؤں میاؤں\" قواعد کی رو سے کیا ہے؟",
        options: ["اسم ظرف", "اسم آلہ", "اسم صوت", "اسم معرفہ"],
        correctAnswer: 2
      },
      {
        id: 5,
        question: "\"تلوار\" کس کی مثال ہے؟",
        options: ["اسم صوت", "اسم آلہ", "اسم نکرہ", "اسم صفت"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "diminutive-augmentative",
    title: "اسم مصغر اور اسم مکبر",
    description: "چیزوں کی بڑائی یا چھوٹائی ظاہر کرنے والے نام",
    questions: [
      {
        id: 1,
        question: "وہ اسم جو کسی چیز کے بڑے ہونے کو ظاہر کرے، اسے کیا کہتے ہیں؟",
        options: ["اسم مصغر", "اسم مکبر", "اسم آلہ", "اسم صوت"],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "وہ اسم جو کسی چیز کے چھوٹے ہونے کو ظاہر کرے، اسے کہتے ہیں:",
        options: ["اسم مکبر", "اسم مصغر", "اسم ظرف", "اسم معرفہ"],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "لفظ \"دیگ\" کا اسم مصغر کیا ہے؟",
        options: ["دیگڑا", "دیگچی", "دیگی", "بڑی دیگ"],
        correctAnswer: 1
      },
      {
        id: 4,
        question: "درج ذیل میں سے اسم مکبر کی نشاندہی کریں:",
        options: ["ٹوپی", "گھڑی", "شاہسوار", "پیالی"],
        correctAnswer: 2
      }
    ]
  },
  {
    id: "sentence-types",
    title: "جملہ اسمیہ اور جملہ فعلیہ",
    description: "جملوں کی ساخت اور ان کے اجزاء",
    questions: [
      {
        id: 1,
        question: "وہ جملہ جس میں مسند اور مسند الیہ دونوں اسم ہوں اور جس میں فعل ناقص پایا جائے، اسے کیا کہتے ہیں؟",
        options: ["جملہ فعلیہ", "جملہ اسمیہ", "جملہ انشائیہ", "جملہ خبریہ"],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "وہ جملہ جس میں مسند الیہ اسم ہو اور مسند فعل تام ہو، اسے کہتے ہیں:",
        options: ["جملہ اسمیہ", "جملہ فعلیہ", "جملہ دعائیہ", "جملہ معترضہ"],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "جملہ اسمیہ کے کتنے بنیادی اجزاء ہوتے ہیں؟",
        options: ["2", "3", "4", "5"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "active-passive",
    title: "فعل معروف اور فعل مجہول",
    description: "کام کرنے والے کا معلوم ہونا یا نہ ہونا",
    questions: [
      {
        id: 1,
        question: "وہ فعل جس کا فاعل (کام کرنے والا) معلوم ہو، اسے کیا کہتے ہیں؟",
        options: ["فعل مجہول", "فعل معروف", "فعل لازم", "فعل ناقص"],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "وہ فعل جس کا فاعل معلوم نہ ہو بلکہ جملے کی نسبت مفعول کی طرف ہو، کہلاتا ہے:",
        options: ["فعل معروف", "فعل مجہول", "فعل متعدی", "فعل تام"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "synonyms-antonyms",
    title: "مترادف اور متضاد",
    description: "ہم معنی اور الٹ معنی والے الفاظ",
    questions: [
      {
        id: 1,
        question: "لفظ \"خورشید\" کا مترادف کیا ہے؟",
        options: ["چاند", "سورج", "تارا", "بادل"],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "لفظ \"کفر\" کا متضاد کیا ہے؟",
        options: ["شرک", "اسلام", "الحاد", "منافقت"],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "\"تریاق\" کا درست متضاد چنیں:",
        options: ["دوا", "زہر", "شفا", "شہد"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "allusion",
    title: "تلمیح",
    description: "تاریخی، مذہبی یا افسانوی واقعے کی طرف اشارہ",
    questions: [
      {
        id: 1,
        question: "کلام میں کسی تاریخی، مذہبی یا افسانوی واقعے کی طرف اشارہ کرنے کو کیا کہتے ہیں؟",
        options: ["تشبیہ", "استعارہ", "تلمیح", "کنایہ"],
        correctAnswer: 2
      },
      {
        id: 2,
        question: "تلمیح کے لغوی معنی کیا ہیں؟",
        options: ["چھپانا", "اشارہ کرنا", "وضاحت کرنا", "مبالغہ کرنا"],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "\"آگ ہے، اولادِ ابراہیم ہے، نمرود ہے\" اس مصرع میں کون سی تلمیح استعمال ہوئی ہے؟",
        options: ["مذہبی", "افسانوی", "سیاسی", "اخلاقی"],
        correctAnswer: 0
      }
    ]
  },
  {
    id: "prefixes-suffixes",
    title: "سابقے اور لاحقے",
    description: "الفاظ کے شروع یا آخر میں لگنے والے حروف",
    questions: [
      {
        id: 1,
        question: "وہ حرف یا لفظ جو کسی بامعنی لفظ کے شروع میں جوڑ دیا جائے، اسے کیا کہتے ہیں؟",
        options: ["لاحقہ", "سابقہ", "صفت", "فعل"],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "وہ حرف یا لفظ جو کسی بامعنی لفظ کے آخر میں لگایا جائے، کہلاتا ہے:",
        options: ["سابقہ", "علامت", "لاحقہ", "ضمیر"],
        correctAnswer: 2
      },
      {
        id: 3,
        question: "\"باادب\" میں \"با\" کیا ہے؟",
        options: ["لاحقہ", "سابقہ", "حرف جار", "صفت"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "singular-plural",
    title: "واحد اور جمع",
    description: "ایک اور ایک سے زیادہ چیزوں کے نام",
    questions: [
      {
        id: 1,
        question: "لفظ \"استاد\" کی درست عربی جمع کیا ہے؟",
        options: ["استادوں", "استادیں", "اساتذہ", "اساتذوں"],
        correctAnswer: 2
      },
      {
        id: 2,
        question: "\"شعر\" کی جمع مکسر کیا ہے؟",
        options: ["شعروں", "اشعار", "شعراء", "شاعری"],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "\"لفظ\" کی درست جمع کی نشاندہی کریں:",
        options: ["لفظوں", "الفاظ", "لفظیں", "تلفظ"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "idioms-proverbs",
    title: "محاورے اور ضرب الامثال",
    description: "روزمرہ کی بول چال اور حکمت بھری باتیں",
    questions: [
      {
        id: 1,
        question: "محاورہ \"آسمان سے باتیں کرنا\" کا درست مطلب کیا ہے؟",
        options: ["بہت اونچا ہونا", "غرور کرنا", "بارش ہونا", "خواب دیکھنا"],
        correctAnswer: 0
      },
      {
        id: 2,
        question: "\"آستین کا سانپ\" سے کیا مراد ہے؟",
        options: ["پالتو جانور", "چھپا ہوا دشمن", "زہریلا سانپ", "وفادار دوست"],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "ضرب المثل مکمل کریں: \"آ بیل مجھے ________\"",
        options: ["مار", "پیار کر", "دکھا", "بھگا"],
        correctAnswer: 0
      }
    ]
  },
  {
    id: "punctuation",
    title: "رموز اوقاف",
    description: "تحریر میں ٹھہرنے اور رکنے کی علامات",
    questions: [
      {
        id: 1,
        question: "تحریر میں ٹھہرنے، رکنے یا آواز کے اتار چڑھاؤ کی علامات کو کیا کہتے ہیں؟",
        options: ["رموز اوقاف", "حروف جار", "اعراب", "علامات اسم"],
        correctAnswer: 0
      },
      {
        id: 2,
        question: "جملہ ختم ہونے پر جو علامت لگائی جاتی ہے، اسے کیا کہتے ہیں؟",
        options: ["سکتہ", "وقفہ", "ختمہ", "رابطہ"],
        correctAnswer: 2
      },
      {
        id: 3,
        question: "مختصر ترین ٹھہراؤ کے لیے کون سی علامت استعمال ہوتی ہے؟",
        options: ["رابطہ", "سکتہ", "وقفہ", "تفصیلیہ"],
        correctAnswer: 1
      }
    ]
  }
];
