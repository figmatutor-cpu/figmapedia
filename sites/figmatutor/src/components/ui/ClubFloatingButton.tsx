import styles from "./club-floating-button.module.css";

const CLUB_RECRUIT_URL = "https://www.huddling.club/shop_view?idx=14";

export function ClubFloatingButton() {
  return (
    <div className={styles.floating}>
      <a
        className={styles.button}
        href={CLUB_RECRUIT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="허들링 클럽 3기 모집 신청 (새 창)"
      >
        허들링 클럽
        <br />
        3기 모집
      </a>
    </div>
  );
}
