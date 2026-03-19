export interface MinistryProgram {
  slug: string;
  title: string;
  tagline: string;
  heroImage: string;
  cardImage: string;
  icon: string; // lucide icon name
  color: string;
  goalText: string;
  description: string;
  subPrograms: {
    title: string;
    description: string;
  }[];
  howToSupport: {
    intro: string;
    steps: string[];
    note?: string;
  };
  sponsorshipTiers?: {
    amount: string;
    frequency: string;
  }[];
  scripture: {
    text: string;
    reference: string;
  };
  giveFundId: string;
}

export const MINISTRY_IMAGES = {
  heroOverview: "https://images.unsplash.com/photo-1609126385558-bc3fc5082b0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQaGlsaXBwaW5lcyUyMHJ1cmFsJTIwY2h1cmNoJTIwY29tbXVuaXR5JTIwd29yc2hpcCUyMGdhdGhlcmluZ3xlbnwxfHx8fDE3NzI0NTA5MDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  feeding: "https://images.unsplash.com/photo-1661200795132-0c4f5dd51366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGNvbW11bml0eSUyMG1lYWwlMjBmb29kJTIwY2hhcml0eSUyMFBoaWxpcHBpbmVzfGVufDF8fHx8MTc3MjQ1MDkxNXww&ixlib=rb-4.1.0&q=80&w=1080",
  childSponsorship: "https://images.unsplash.com/photo-1609051408500-b3ef7377b799?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxGaWxpcGlubyUyMHN0dWRlbnQlMjBlZHVjYXRpb24lMjBzY2hvb2wlMjB1bmlmb3JtJTIwUGhpbGlwcGluZXN8ZW58MXx8fHwxNzcyNDUwOTA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  seniorCitizen: "https://images.unsplash.com/photo-1643582817290-3626123e3871?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwRmlsaXBpbm8lMjBzZW5pb3IlMjBjaXRpemVuJTIwY2FyZSUyMGdpZnQlMjBnaXZpbmd8ZW58MXx8fHwxNzcyNDUwOTA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  ofw: "https://images.unsplash.com/photo-1767858703859-6f40f37d36a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxGaWxpcGlubyUyMGZhbWlseSUyMHJldW5pb24lMjBvdmVyc2VhcyUyMHdvcmtlciUyMGhvbWVjb21pbmd8ZW58MXx8fHwxNzcyNDUwOTA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
};

export const ministries: MinistryProgram[] = [
  {
    slug: "feeding-program",
    title: "Feeding Program",
    tagline: "Nourishing bodies and souls in underserved communities",
    heroImage: MINISTRY_IMAGES.feeding,
    cardImage: MINISTRY_IMAGES.feeding,
    icon: "Utensils",
    color: "#C84C3D",
    goalText:
      "To give children and their families in depressed areas an opportunity for physical, intellectual, social, and spiritual nourishment through regular feeding and sharing the Gospel.",
    description:
      "In marginalized communities across the Philippines, many families struggle to provide consistent, nutritious meals for their children. Our Feeding Program addresses this need while opening doors for the Gospel. Through our partner churches, we serve meals weekly and share God's Word with every child and family we reach.",
    subPrograms: [
      {
        title: "Weekly Feeding",
        description:
          "Our partner churches feed children with nutritious food that helps keep them healthy and their minds sharp. This is done in partnership with organizations and individuals who provide support for the needy.",
      },
      {
        title: "Consistent Biblical Instruction",
        description:
          "In a time where children are bombarded with social media and influencers on how to live life, our local church's weekly programs help children stay rooted and grounded in God's Word. Bible stories provide them with heroes of faith to emulate, pointing to Jesus Christ as the Savior and Lord they need.",
      },
    ],
    howToSupport: {
      intro:
        "Support a Feeding Area on Your Birth Month! On your birthday, you can be a blessing by sponsoring a feeding area's food for one month.",
      steps: [
        "Contact us about your interest in supporting a feeding program on your birth month.",
        "Once you have discussed with us, proceed with your donation for the amount you wish to give.",
      ],
      note: "Please do not donate until you have contacted us first. We will discuss the program's goals, processes, and commitment with you.",
    },
    scripture: {
      text: "For I was hungry and you gave me something to eat, I was thirsty and you gave me something to drink, I was a stranger and you invited me in.",
      reference: "Matthew 25:35",
    },
    giveFundId: "child",
  },
  {
    slug: "child-sponsorship",
    title: "Child Sponsorship",
    tagline: "Investing in the next generation through education and faith",
    heroImage: MINISTRY_IMAGES.childSponsorship,
    cardImage: MINISTRY_IMAGES.childSponsorship,
    icon: "GraduationCap",
    color: "#103B53",
    goalText:
      "To connect individual and group sponsors to dedicated children seeking a better life through education — from kindergarten to college.",
    description:
      "Education is one of the most powerful tools for breaking the cycle of poverty. Our Child Sponsorship Program partners sponsors with children from underprivileged families, covering school expenses while nurturing spiritual growth through regular church participation and Bible teaching.",
    subPrograms: [
      {
        title: "Subsidies for School Expenses",
        description:
          "The program works with each child's parents by helping lessen the burden of school expenses. Children are sponsored annually to help pay for uniforms, books, stationeries, and school projects. For college students, subsidies are allotted for tuition fees.",
      },
      {
        title: "Spiritual Formation",
        description:
          "The program emphasizes regular church activity participation where the Bible is taught. We believe the key to freedom from poverty is a transformation of the mind and heart. The Word of God has done that for societies in the past, and we believe it will do so for the children in the program.",
      },
    ],
    howToSupport: {
      intro:
        "Sponsoring a child with Kapatid Ministry is a beautiful way to share God's love! Your support helps provide education, healthcare, and hope to children in need.",
      steps: [
        "Contact us about your interest in sponsoring a child.",
        "Once you have discussed with us, proceed with your chosen sponsorship amount and frequency.",
      ],
      note: "Please do not donate until you have contacted us first. We will discuss the child sponsorship program's goals, processes, and commitment with you.",
    },
    sponsorshipTiers: [
      { amount: "667", frequency: "Monthly" },
      { amount: "2,000", frequency: "Quarterly" },
      { amount: "4,000", frequency: "Bi-Annual" },
      { amount: "8,000", frequency: "Annually" },
    ],
    scripture: {
      text: "Train up a child in the way he should go; even when he is old he will not depart from it.",
      reference: "Proverbs 22:6",
    },
    giveFundId: "child",
  },
  {
    slug: "senior-citizen-ministry",
    title: "Senior Citizen Ministry",
    tagline: "Sharing the Gospel with the elderly before they meet Him in glory",
    heroImage: MINISTRY_IMAGES.seniorCitizen,
    cardImage: MINISTRY_IMAGES.seniorCitizen,
    icon: "HeartHandshake",
    color: "#D89B3C",
    goalText:
      "To get the Gospel to the ears of senior citizens, many of whom are old and immobile. Our prayer is that God will open their hearts that they will surrender their lives to Christ before they meet Him in glory.",
    description:
      "Many senior citizens in the Philippines live in isolation, often immobile and without regular visitors. Our Senior Citizen Ministry brings both physical gifts and the life-giving Gospel to their doorsteps through our network of partner churches.",
    subPrograms: [
      {
        title: "Gift-Giving",
        description:
          "We give gift packs to our senior citizens containing items like milk, rice, canned goods, eggs, and other consumables. Our aim is to bring joy to their hearts through these simple but meaningful gifts.",
      },
      {
        title: "Sharing the Gospel",
        description:
          "Our partner churches identify seniors to visit and bless with the Word of God. During the gift-giving, the Gospel is shared with the senior citizen and his or her family members who are present.",
      },
    ],
    howToSupport: {
      intro:
        "Seasonally we have Bless-a-Senior Citizen Programs! You can help us give gifts to seniors and share the Gospel with them through any amount you are called to give.",
      steps: [
        "Contact us about your interest in supporting our Bless-a-Senior Program.",
        "Once you have discussed with us, proceed with your donation for the amount you wish to give.",
      ],
      note: "Please do not donate until you have contacted us first. We will discuss the program's goals, processes, and commitment with you.",
    },
    scripture: {
      text: "Gray hair is a crown of glory; it is gained in a righteous life.",
      reference: "Proverbs 16:31",
    },
    giveFundId: "general",
  },
  {
    slug: "ofw-families",
    title: "OFW Families Ministry",
    tagline: "Bringing the Gospel and unity to families of Overseas Filipino Workers",
    heroImage: MINISTRY_IMAGES.ofw,
    cardImage: MINISTRY_IMAGES.ofw,
    icon: "Home",
    color: "#103B53",
    goalText:
      "To bring the Gospel to the family of the OFW, and to connect the OFW family to a local church.",
    description:
      "Millions of Filipino families are separated by overseas work. The emotional, relational, and spiritual toll is immense. Our OFW Families Ministry partners with local churches to visit these families, provide care and counseling, and ultimately connect them to a faithful church family.",
    subPrograms: [
      {
        title: "Family Visitation",
        description:
          "Together with community partner churches, we visit Overseas Filipino Workers' families and seek to provide care, counseling, and direction. We meet them on a regular basis to help build unity and love among family members and towards their OFWs.",
      },
      {
        title: "Connect to a Local Church",
        description:
          "We aim to encourage the family to join a Bible-believing, Gospel-preaching local church that will be their spiritual family. Our hope is that when the OFW returns home, they will grow together in the faith under the care of a faithful local church.",
      },
    ],
    howToSupport: {
      intro:
        "There are two ways you can support: refer an OFW family for visitation, or give to support our outreach efforts.",
      steps: [
        "If you are an OFW and would like to partner in ministering to your family, contact us for a referral.",
        "To give financially, contact us first about your interest in supporting the OFW family ministry.",
        "Once you have discussed with us, proceed with your donation for the amount you wish to give.",
      ],
      note: "This ministry requires collaboration and resources. Consider praying and giving to support our efforts of getting the Gospel to OFW families through visitation and Bible studies.",
    },
    scripture: {
      text: "But if anyone does not provide for his relatives, and especially for members of his household, he has denied the faith and is worse than an unbeliever.",
      reference: "1 Timothy 5:8",
    },
    giveFundId: "ofw",
  },
];
