import styles from './style.module.scss';


export default function Header() {
  return (
    <header className={styles['header']}>
      <nav>
        <h1>Accounts Center</h1>
      </nav>
    </header>
  );
}
