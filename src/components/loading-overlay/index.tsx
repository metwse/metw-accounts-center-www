import styles from './style.module.scss';


export default function LoadingOverlay(
  { isActive }: { isActive: boolean }
) {
  return (
    <>
      {
        isActive ?
          <div className={styles['loading-overlay']}>
            <div></div>
          </div>
          : null
      }
    </>
  )
}
