export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  category: "tech" | "selfhelp";
  categoryLabel: string;
  status: "reading" | "completed" | "want-to-read";
  statusLabel: string;
  coverImage: string;
  rating?: number;
  progress?: number;
  currentChapter?: string;
  pages?: number;
  yearRead?: string;
  quote?: string;
  summary: string;
  review: string;
  keyTakeaways: string[];
  link?: string;
  tags: string[];
}

export const booksData: Book[] = [
  {
    id: "ddia",
    title: "Designing Data-Intensive Applications",
    subtitle: "The Big Ideas Behind Reliable, Scalable, and Maintainable Systems",
    author: "Martin Kleppmann",
    category: "tech",
    categoryLabel: "Data Systems & Architecture",
    status: "reading",
    statusLabel: "Đang đọc",
    coverImage: "/books/ddia.jpg",
    rating: 5.0,
    progress: 78,
    currentChapter: "Ch 10: Batch Processing & MapReduce",
    pages: 616,
    yearRead: "2026",
    quote: "Reliable, scalable, and maintainable systems don't happen by accident. They are built through careful tradeoffs.",
    summary: "Cuốn sách nền tảng khám phá kiến trúc bên dưới các hệ thống dữ liệu hiện đại: từ Storage Engines (LSM-Trees vs B-Trees), Data Encoding, Replication, Partitioning đến Distributed Transactions & Stream Processing.",
    review: "Đây chắc chắn là cuốn sách 'Kinh Thánh' cho bất kỳ ai định hướng làm Data Engineer hoặc Software Architect. Martin Kleppmann giải thích các khái niệm cực kỳ chi tiết, trực quan và không hoa mỹ. Cuốn sách giúp mình hiểu bản chất từng đánh đổi (tradeoff) khi thiết kế pipeline dữ liệu lớn.",
    keyTakeaways: [
      "Bản chất đánh đổi giữa CAP Theorem, PACELC Theorem và Eventual Consistency trong distributed systems.",
      "Sự khác biệt cốt lõi giữa B-Tree (ghi chậm, đọc nhanh) và LSM-Tree (ghi cực nhanh, hợp cho log-structured engine).",
      "Cách thiết kế idempotency và exactly-once semantics trong stream processing với Kafka & Flink."
    ],
    link: "https://dataintensive.net/",
    tags: ["Big Data", "Distributed Systems", "Database", "Architecture"]
  },
  {
    id: "clean-code",
    title: "Clean Code",
    subtitle: "A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    category: "tech",
    categoryLabel: "Software Engineering",
    status: "completed",
    statusLabel: "Đã đọc",
    coverImage: "/books/clean-code.jpg",
    rating: 4.8,
    pages: 464,
    yearRead: "2024",
    quote: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    summary: "Hướng dẫn thực hành viết mã nguồn sạch, dễ đọc, dễ bảo trì, quy tắc đặt tên, cấu trúc hàm, xử lý ngoại lệ và xây dựng bộ unit test mạnh mẽ.",
    review: "Cuốn sách tạo ra bước ngoặt trong tư duy viết code của mình. Từ việc đặt tên biến có ý nghĩa, chia nhỏ hàm ngắn gọn (Do one thing) đến việc áp dụng Boy Scout Rule ('Luôn để lại codebase sạch hơn lúc bạn tìm thấy nó').",
    keyTakeaways: [
      "Tên biến và hàm phải tự giải thích ý nghĩa (Intent-revealing names), hạn chế tối đa việc dùng comment thừa.",
      "Hàm chỉ nên thực hiện 1 việc duy nhất và giữ số lượng tham số ít nhất có thể.",
      "FIRST principles trong Unit Testing: Fast, Independent, Repeatable, Self-validating, Timely."
    ],
    link: "https://www.oreilly.com/library/view/clean-code-a/9780132350884/",
    tags: ["Clean Code", "Refactoring", "Best Practices", "Software Quality"]
  },
  {
    id: "system-design",
    title: "System Design Interview",
    subtitle: "An Insider's Guide (Volume 1 & 2)",
    author: "Alex Xu",
    category: "tech",
    categoryLabel: "System Design",
    status: "completed",
    statusLabel: "Đã đọc",
    coverImage: "/books/system-design.jpg",
    rating: 4.9,
    pages: 320,
    yearRead: "2025",
    quote: "System design is about making choices between conflicting requirements under finite constraints.",
    summary: "Tổng hợp các bài toán thiết kế hệ thống thực tế như Rate Limiter, Consistent Hashing, Key-Value Store, Unique ID Generator, Web Crawler, và News Feed System.",
    review: "Cách tiếp cận theo từng bước (4-step framework) cực kỳ khoa học. Minh họa sơ đồ trực quan giúp mình dễ hình dung luồng dữ liệu, caching strategy và cách scale quy mô hệ thống từ 0 lên millions of users.",
    keyTakeaways: [
      "Khung 4 bước xử lý câu hỏi System Design: Understand requirement -> High level design -> Deep dive -> Wrap up.",
      "Ứng dụng Consistent Hashing trong việc phân tán load và tránh rehashing toàn bộ node khi cluster thay đổi.",
      "Thiết kế Caching Layers & Message Queues để de-couple các microservices có lưu lượng tăng đột biến."
    ],
    link: "https://bytebytego.com/",
    tags: ["System Design", "Scalability", "Microservices", "Interview"]
  },
  {
    id: "microservices",
    title: "Building Microservices",
    subtitle: "Designing Fine-Grained Systems (2nd Edition)",
    author: "Sam Newman",
    category: "tech",
    categoryLabel: "Cloud & Architecture",
    status: "completed",
    statusLabel: "Đã đọc",
    coverImage: "/books/microservices.jpg",
    rating: 4.7,
    pages: 614,
    yearRead: "2025",
    quote: "Microservices aren't a free lunch. You trade operational complexity for independent deployability.",
    summary: "Cung cấp cái nhìn toàn diện về phương pháp phân tách monolith thành microservices, thiết kế API communication, quản lý distributed transactions (Saga), Security và Monitoring.",
    review: "Cuốn sách thực tế không tô hồng microservices mà thẳng thắn phân tích độ phức tạp về mặt vận hành. Rất đáng đọc trước khi bắt tay thiết kế kiến trúc phân tán cho doanh nghiệp.",
    keyTakeaways: [
      "Chiến lược Strangler Fig Pattern để từng bước tách nhỏ monolith mà không gây gián đoạn hệ thống.",
      "Chuyển đổi giao tiếp giữa các dịch vụ từ Synchronous (REST/gRPC) sang Asynchronous Event-Driven.",
      "Saga Pattern (Orchestration vs Choreography) giải quyết bài toán nhất quán dữ liệu liên dịch vụ."
    ],
    link: "https://samnewman.io/books/building_microservices_2nd_edition/",
    tags: ["Microservices", "Distributed Systems", "Cloud", "Saga Pattern"]
  },
  {
    id: "database-internals",
    title: "Database Internals",
    subtitle: "A Deep Dive into Storage and Distributed Data Processing",
    author: "Alex Petrov",
    category: "tech",
    categoryLabel: "Database Systems",
    status: "want-to-read",
    statusLabel: "Dự định đọc",
    coverImage: "/books/database-internals.jpg",
    pages: 376,
    quote: "To truly master databases, you must look underneath the SQL query engine into the storage engines.",
    summary: "Hướng dẫn chuyên sâu về cấu trúc lưu trữ bên trong cơ sở dữ liệu: B-Tree variants, Log-Structured Storage, WAL, Buffer Pool management, Consensus (Raft/Paxos) và Distributed Transactions.",
    review: "Sách được giới Data Engineers đánh giá rất cao về độ sâu kỹ thuật. Mình đưa vào danh sách đọc ưu tiên cho quý tới để nâng cao kiến thức về internals của Postgres, ClickHouse và Cassandra.",
    keyTakeaways: [
      "Phân tích chuyên sâu về B+Tree, B*Tree và SkipLists.",
      "Cơ chế Crash Recovery với Write-Ahead Logging (WAL) và ARIES protocol.",
      "Distributed Consensus Algorithms: Raft, Paxos và Spanner TrueTime."
    ],
    link: "https://www.databass.dev/",
    tags: ["Database", "Storage Engines", "Internals", "Distributed Consensus"]
  },
  {
    id: "pragmatic-programmer",
    title: "The Pragmatic Programmer",
    subtitle: "Your Journey To Mastery (20th Anniversary Edition)",
    author: "Andrew Hunt & David Thomas",
    category: "tech",
    categoryLabel: "Software Engineering",
    status: "completed",
    statusLabel: "Đã đọc",
    coverImage: "/books/pragmatic-programmer.jpg",
    rating: 5.0,
    pages: 352,
    yearRead: "2024",
    quote: "You are shape-shifting software. Don't be afraid to change your code when requirements change.",
    summary: "Đúc kết kinh nghiệm lập trình qua 20 năm: Nguyên tắc DRY, tính vuông góc (Orthogonality), đạn vạch đường (Tracer Bullets), tự động hóa công cụ và tư duy liên tục học hỏi.",
    review: "Một cuốn sách trường tồn với thời gian. Không chỉ nói về code, sách còn truyền cảm hứng về đạo đức nghề nghiệp, thái độ làm chủ dự án và cách giao tiếp hiệu quả trong team kỹ thuật.",
    keyTakeaways: [
      "DRY (Don't Repeat Yourself) không chỉ là trùng lặp code, mà là trùng lặp tri thức (knowledge repetition).",
      "Xây dựng tính Orthogonality trong thiết kế: thay đổi ở một module không làm hỏng module khác.",
      "Phương pháp Tracer Bullets giúp phản hồi nhanh chóng từ khách hàng bằng phiên bản chạy được đầu cuối."
    ],
    link: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
    tags: ["Pragmatic", "Career", "Software Craftsmanship", "Best Practices"]
  },
  {
    id: "staff-engineer",
    title: "Staff Engineer",
    subtitle: "Leadership Beyond the Management Track",
    author: "Will Larson",
    category: "tech",
    categoryLabel: "Career & Leadership",
    status: "want-to-read",
    statusLabel: "Dự định đọc",
    coverImage: "/books/staff-engineer.jpg",
    pages: 280,
    quote: "Staff engineering is about setting technical direction and creating leverage for the entire team.",
    summary: "Phân tích chi tiết con đường phát triển chuyên môn kỹ thuật nâng cao (Staff/Principal Engineer), các mô hình archetype (Tech Lead, Architect, Solver, Right Hand) và cách định hình tầm ảnh hưởng kỹ thuật.",
    review: "Định hướng rõ ràng cho kỹ sư phần mềm muốn tiếp tục gắn bó với kỹ thuật mà không cần phải chuyển hướng hẳn sang làm quản lý con người (Engineering Manager).",
    keyTakeaways: [
      "4 archetypes của Staff Engineer: Tech Lead, Architect, Solver, Right Hand.",
      "Tạo ra đòn bẩy kỹ thuật (Technical Leverage) thay vì chỉ trực tiếp tự mình viết code.",
      "Cách viết RFCs / Technical Docs để dẫn dắt định hướng công nghệ tổ chức."
    ],
    link: "https://staffeng.com/book",
    tags: ["Staff Engineer", "Leadership", "Career Growth", "Architecture"]
  },
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    subtitle: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    author: "James Clear",
    category: "selfhelp",
    categoryLabel: "Habits & Productivity",
    status: "completed",
    statusLabel: "Đã đọc",
    coverImage: "/books/atomic-habits.jpg",
    rating: 5.0,
    pages: 320,
    yearRead: "2024",
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    summary: "Phương pháp xây dựng thói quen tốt và loại bỏ thói quen xấu dựa trên 4 quy luật: Rõ ràng (Cue), Hấp dẫn (Craving), Dễ dàng (Response), Thỏa mãn (Reward).",
    review: "Cuốn sách thay đổi tư duy của mình về thói quen cá nhân. Nhờ áp dụng nguyên lý 1% mỗi ngày và thiết kế môi trường làm việc tối ưu, mình giữ được nhịp học công nghệ mới và đọc sách đều đặn.",
    keyTakeaways: [
      "Tập trung vào hệ thống vận hành (Systems) thay vì chỉ đặt ra mục tiêu (Goals).",
      "Xây dựng bản sắc cá nhân (Identity-based habits): 'Tôi là người lập trình chỉn chu' chứ không chỉ 'Tôi muốn viết code giỏi'.",
      "Thiết kế môi trường: Làm cho thói quen tốt trở nên rõ ràng và thói quen xấu trở nên khó khăn."
    ],
    link: "https://jamesclear.com/atomic-habits",
    tags: ["Habits", "Productivity", "Mindset", "Self Improvement"]
  },
  {
    id: "deep-work",
    title: "Deep Work",
    subtitle: "Rules for Focused Success in a Distracted World",
    author: "Cal Newport",
    category: "selfhelp",
    categoryLabel: "Focus & Performance",
    status: "completed",
    statusLabel: "Đã đọc",
    coverImage: "/books/deep-work.jpg",
    rating: 4.9,
    pages: 304,
    yearRead: "2024",
    quote: "The ability to perform deep work is becoming increasingly rare at the exact same time it is becoming increasingly valuable in our economy.",
    summary: "Rèn luyện khả năng tập trung sâu không xao nhãng để giải quyết các bài toán kỹ thuật phức tạp trong thời đại ngập tràn thông báo mạng xã hội.",
    review: "Cực kỳ cần thiết cho Software Engineers. Nhờ áp dụng chiến thuật Time-Blocking và quy tắc tắt thông báo trong 2-3 giờ code liên tục, hiệu suất làm việc của mình tăng lên rõ rệt.",
    keyTakeaways: [
      "Deep Work là năng lực cốt lõi giúp học nhanh các công nghệ khó và tạo ra giá trị khác biệt.",
      "Hạn chế Shallow Work (email, tin nhắn chat lặt vặt) bằng cách ấn định khung giờ xử lý tập trung.",
      "Áp dụng Time-Blocking: Lên kế hoạch chi tiết cho từng giờ trong ngày làm việc."
    ],
    link: "https://calnewport.com/books/deep-work/",
    tags: ["Focus", "Deep Work", "Productivity", "Time Management"]
  },
  {
    id: "psychology-money",
    title: "The Psychology of Money",
    subtitle: "Timeless lessons on wealth, greed, and happiness",
    author: "Morgan Housel",
    category: "selfhelp",
    categoryLabel: "Finance & Mindset",
    status: "reading",
    statusLabel: "Đang đọc",
    coverImage: "/books/psychology-money.jpg",
    rating: 4.9,
    progress: 60,
    currentChapter: "Ch 12: Freedom & Saving Money",
    pages: 256,
    yearRead: "2026",
    quote: "Doing well with money has a little to do with how smart you are and a lot to do with how you behave.",
    summary: "19 câu chuyện ngắn khám phá cách con người nghĩ về tiền bạc, sự tự do tài chính, tính kiên nhẫn và yếu tố may mắn/rủi ro trong đầu tư.",
    review: "Cuốn sách tài chính nhẹ nhàng nhưng sâu sắc. Morgan Housel nhắc nhở rằng tiền bạc mang lại giá trị lớn nhất chính là sự tự do kiểm soát thời gian của cuộc đời mình.",
    keyTakeaways: [
      "Tự do kiểm soát thời gian là cổ tức tài chính cao nhất mà tiền bạc đem lại.",
      "Sự khác biệt giữa Rich (có thu nhập cao) và Wealthy (có tài sản tích lũy bảo vệ tương lai).",
      "Lãi suất kép (Compounding) hoạt động tốt nhất khi bạn kiên nhẫn và tránh những sai lầm thảm họa."
    ],
    link: "https://www.morganhousel.com/",
    tags: ["Finance", "Mindset", "Wisdom", "Wealth"]
  },
  {
    id: "show-your-work",
    title: "Show Your Work!",
    subtitle: "10 Ways to Share Your Creativity and Get Discovered",
    author: "Austin Kleon",
    category: "selfhelp",
    categoryLabel: "Creativity & Personal Brand",
    status: "completed",
    statusLabel: "Đã đọc",
    coverImage: "/books/show-your-work.jpg",
    rating: 4.8,
    pages: 224,
    yearRead: "2025",
    quote: "Share your process. Share your work. Be open, generate value, and let people connect with what you do.",
    summary: "Hướng dẫn xây dựng hiện diện công khai bằng cách tự nhiên chia sẻ tiến trình học tập, thử nghiệm và dự án cá nhân lên không gian mạng.",
    review: "Đây chính là cảm hứng lớn khiến mình xây dựng Bento Portfolio và viết blog. Không cần phải là chuyên gia mới được chia sẻ, chỉ cần hào hứng lan tỏa hành trình học hỏi mỗi ngày.",
    keyTakeaways: [
      "Hãy làm một người nghiệp dư hào hứng (Amateur) — người học công khai và không ngại thử nghiệm.",
      "Chia sẻ quá trình (Process) chứ không chỉ sản phẩm hoàn chỉnh (Product).",
      "Tích lũy tài sản tri thức cá nhân theo thời gian thông qua blog/website riêng."
    ],
    link: "https://austinkleon.com/show-your-work/",
    tags: ["Creativity", "Blogging", "Personal Brand", "Sharing"]
  },
  {
    id: "make-time",
    title: "Make Time",
    subtitle: "How to Focus on What Matters Every Day",
    author: "Jake Knapp & John Zeratsky",
    category: "selfhelp",
    categoryLabel: "Time Management",
    status: "want-to-read",
    statusLabel: "Dự định đọc",
    coverImage: "/books/make-time.jpg",
    pages: 304,
    quote: "If you want to take back control of your time, you have to actively create space for what matters.",
    summary: "Khung làm việc 4 bước đơn giản (Highlight, Laser, Energize, Reflect) giúp tạo ra khoảng trống thời gian cho những điều thực sự quan trọng.",
    review: "Cuốn sách thiết thực đến từ 2 tác giả từng làm tại Google & Google Ventures. Dễ áp dụng ngay vào lịch làm việc hàng ngày.",
    keyTakeaways: [
      "Chọn 1 'Highlight' quan trọng nhất mỗi ngày để tập trung hoàn thành.",
      "Tối ưu năng lượng thể chất (Energize) bằng ngủ đủ giấc, vận động và ăn uống hợp lý.",
      "Đánh giá và điều chỉnh (Reflect) thói quen sử dụng điện thoại mỗi tối."
    ],
    link: "https://maketime.blog/",
    tags: ["Time Management", "Focus", "Energy", "Productivity"]
  }
];
