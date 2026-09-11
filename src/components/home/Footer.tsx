import Image from "next/image";
import Link from "next/link";
import { SocialLinks } from "./SocialLinks";
import styles from "./footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.branding}>
          <Link href="/" aria-label="HighStand 홈" className={styles.logo}>
            <Image src="/images/footer/logo.svg" alt="HighStand" width={164} height={28} />
          </Link>
          <dl className={styles.details}>
            <div><dt>대표자</dt><dd>하이서</dd></div>
            <div><dt>사업장 주소</dt><dd><address>경기도 성남시 중원구 광명로 377 신구대학교 창업관 808호</address></dd></div>
            <div><dt>사업자 등록번호</dt><dd>430-36-01441</dd></div>
          </dl>
        </div>
        <div className={styles.meta}>
          <SocialLinks className={styles.social} />
          <p className={styles.copyright}>©2026 Highstand. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
