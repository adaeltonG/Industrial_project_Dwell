import Image from "next/image";
import Link from "next/link";
import logoImage from "@/Logo.jpg";

type WordmarkProps = {
  admin?: boolean;
  light?: boolean;
};

export function Wordmark({ admin = false, light = false }: WordmarkProps) {
  return (
    <Link
      className={`wordmark${light ? " wordmark--light" : ""}`}
      href={admin ? "/admin" : "/"}
      aria-label={admin ? "Dwell admin homepage" : "Dwell homepage"}
    >
      <Image
        src={logoImage}
        alt=""
        className="wordmark__image"
        priority
        sizes="(max-width: 760px) 124px, 138px"
      />
      {admin ? <span className="wordmark__admin">· Admin</span> : null}
    </Link>
  );
}
