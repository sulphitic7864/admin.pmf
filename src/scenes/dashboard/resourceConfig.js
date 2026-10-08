import { ArticleOutlined, EmailOutlined, FeedbackOutlined, LocalOfferOutlined, MovieOutlined, PaymentsOutlined, PeopleAltOutlined } from "@mui/icons-material";
import { API_ENDPOINTS } from "../../api/endpoints";
import { responseRows } from "../../api/client";

export const resourceConfig = {
  blogs: {
    title: "Blogs",
    subtitle: "Create and manage the stories published on Place My Films.",
    endpoint: API_ENDPOINTS.blogs.list,
    columns: [
      ["title", "Blog title", 210],
      ["author", "Author", 140],
      ["type", "Category", 110],
      ["status", "Status", 110],
      ["noOfReaders", "Readers", 95],
      ["createdAt", "Published", 150],
    ],
    icon: ArticleOutlined,
    deletable: true,
    blogActions: true,
  },
  payments: {
    title: "Payments",
    subtitle: "Review payment transactions recorded by the platform.",
    endpoint: API_ENDPOINTS.payments.list,
    columns: [
      ["payID", "Payment ID", 210],
      ["customerName", "Customer", 160],
      ["company", "Company", 150],
      ["email", "Email", 220],
      ["phone", "Phone", 130],
      ["country", "Country", 100],
      ["paymentAmount", "Amount", 120],
      ["currency", "Currency", 95],
      ["status", "Status", 120],
      ["packageTitle", "Package", 210],
      ["packageAmount", "Package price", 130],
      ["createdAt", "Created", 175],
    ],
    icon: PaymentsOutlined,
    paymentActions: true,
  },
  feedback: {
    title: "Feedbacks",
    subtitle: "Read feedback submitted by the Place My Films community.",
    endpoint: API_ENDPOINTS.feedback.list,
    columns: [
      ["id", "ID", 75],
      ["blogId", "Blog ID", 95],
      ["description", "Description", 290],
      ["feedBackType", "Feedback type", 150],
      ["createdAt", "Received", 160],
    ],
    icon: FeedbackOutlined,
    deletable: true,
  },
  coupons: {
    title: "Coupons",
    subtitle: "Create, update, and manage promotional coupon codes.",
    endpoint: API_ENDPOINTS.coupons.list,
    columns: [
      ["code", "Code", 160],
      ["details", "Details", 280],
      ["amount", "Discount", 110],
      ["status", "Status", 115],
      ["createdAt", "Created", 160],
    ],
    icon: LocalOfferOutlined,
    deletable: true,
    couponActions: true,
  },
  users: {
    title: "Users",
    subtitle: "View registered user accounts and their profile details.",
    endpoint: API_ENDPOINTS.users.list,
    columns: [
      ["id", "User ID", 90],
      ["fullName", "Name", 190],
      ["username", "Username", 170],
      ["email", "Email address", 240],
      ["createdAt", "Joined", 180],
      ["updatedAt", "Last updated", 180],
    ],
    icon: PeopleAltOutlined,
    deletable: true,
    userActions: true,
  },
  videos: {
    title: "All videos",
    subtitle: "Review videos uploaded by the Place My Films community.",
    endpoint: API_ENDPOINTS.videos.listAll,
    columns: [
      ["id", "ID", 85],
      ["title", "Title", 220],
      ["user_id", "User ID", 100],
      ["packageType", "Package", 110],
      ["festivalId", "Festival ID", 110],
      ["submissionStatus", "Submission status", 165],
      ["viewCount", "Views", 85],
      ["createdAt", "Uploaded", 180],
    ],
    icon: MovieOutlined,
    deletable: true,
    videoActions: true,
  },
  contacts: {
    title: "Contact inbox",
    subtitle: "Messages submitted through the Place My Films contact form.",
    endpoint: API_ENDPOINTS.contacts.list,
    collectionProperty: "contact",
    columns: [
      ["firstName", "First name", 130],
      ["lastName", "Last name", 130],
      ["email", "Email address", 220],
      ["phoneNumber", "Phone", 150],
      ["message", "Message", 280],
      ["createdAt", "Received", 165],
    ],
    icon: EmailOutlined,
    deletable: true,
  },
};

export const dashboardItems = [
  { key: "blogs", label: "Published blogs", path: "/blog", icon: ArticleOutlined, color: "blue" },
  { key: "payments", label: "Payment records", path: "/payments", icon: PaymentsOutlined, color: "green" },
  { key: "users", label: "Registered users", path: "/users", icon: PeopleAltOutlined, color: "violet" },
  { key: "contacts", label: "Contact messages", path: "/contactusemail", icon: EmailOutlined, color: "orange" },
  { key: "feedback", label: "Feedback entries", path: "/feedback", icon: FeedbackOutlined, color: "pink" },
  { key: "videos", label: "Uploaded videos", path: "/videos", icon: MovieOutlined, color: "cyan" },
];

export function getRecordId(row) {
  return row.id ?? row.ID ?? row.pay_id;
}

export function formatCell(value, field) {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "createdAt" || field === "updatedAt") {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? String(value)
      : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
  }
  return String(value);
}

export function normalizeRows(data, property) {
  if (property) return responseRows(data, property);
  if (Array.isArray(data?.result)) return data.result;
  if (data?.result && typeof data.result === "object") return [data.result];
  if (Array.isArray(data?.contact)) return data.contact;
  return responseRows(data);
}

export function normalizePaymentRow(row) {
  const user = row.user ?? {};
  const billing = row.billingdetails ?? {};
  const payment = row.payments ?? {};
  const packageDetails = row.packagedetails ?? {};
  const firstName = user.firstName ?? billing.first_name ?? "";
  const lastName = user.lastName ?? billing.last_name ?? "";

  return {
    ...row,
    payID: payment.pay_id ?? row.payID ?? row.pay_id ?? "",
    customerName: [firstName, lastName].filter(Boolean).join(" "),
    company: billing.company_name ?? "",
    email: user.email ?? billing.email_add ?? "",
    phone: billing.phone ?? "",
    country: billing.country ?? "",
    paymentAmount: payment.amount ?? row.amount ?? "",
    currency: payment.currency ?? row.currency ?? "",
    status: payment.status ?? row.status ?? "",
    packageTitle: packageDetails.title?.trim() ?? "",
    packageAmount: packageDetails.amount ?? "",
    createdAt: payment.createdAt ?? row.createdAt,
  };
}

export function normalizeUserRow(row) {
  const firstName = row.firstName ?? "";
  const lastName = row.lastName ?? "";

  return {
    id: row.id,
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(" "),
    username: row.username ?? "",
    email: row.email ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function formatPaymentAmount(amount, currency) {
  if (amount === null || amount === undefined || amount === "") return "—";
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return String(amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: String(currency || "USD").toUpperCase(),
    }).format(numericAmount / 100);
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return `${(numericAmount / 100).toFixed(2)} ${String(currency || "USD").toUpperCase()}`;
  }
}

export function formatPaymentDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
