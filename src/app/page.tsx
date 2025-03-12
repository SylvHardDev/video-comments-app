// import Link from "next/link";
import LoginPage from "./auth/login/page";

export default function Home() {
  return (
    <div className="flex flex-col gap-5 items-center justify-center min-h-screen p-4">
      <LoginPage />
      {/* <Link href="/videos">
        <button className="border border-white rounded-sm px-5 py-2 cursor-pointer">
          Go to Videos
        </button>
      </Link>
      <Link href="/upload">
        <button className="border border-white rounded-sm px-5 py-2 cursor-pointer">
          Go to Upload
        </button>
      </Link> */}
    </div>
  );
}
