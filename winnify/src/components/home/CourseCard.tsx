import styles from './CourseCard.module.css';

interface CourseCardProps {
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessons: number;
  rating: number;
  image: string;
  tags?: string[];
}

export default function CourseCard({
  title,
  description,
  level,
  duration,
  lessons,
  rating,
  image,
  tags = [],
}: CourseCardProps) {
  const levelClass = level.toLowerCase() as 'beginner' | 'intermediate' | 'advanced';

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <div className={styles.imagePlaceholder} style={{ background: image }}>
          <span className={`${styles.levelBadge} ${styles[levelClass]}`}>
            {level}
          </span>
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            ⭐ {rating.toFixed(1)}
          </span>
          <span className={styles.metaItem}>
            📖 {lessons} Lessons
          </span>
          <span className={styles.metaItem}>
            ⏱️ {duration}
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.startBtn}>Start Learning</button>
        <button className={styles.saveBtn} aria-label="Save course">🔖</button>
      </div>
    </article>
  );
}
