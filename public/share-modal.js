(() => {
  function initShareModal() {
    const modal = document.querySelector('[data-share-modal]')
    const openBtn = document.querySelector('[data-share-modal-open]')
    const closeBtn = document.querySelector('[data-share-modal-close]')

    if (!modal || !openBtn || !closeBtn) return false
    if (modal.dataset.bound === '1') return true
    modal.dataset.bound = '1'

    const onOpen = () => modal.setAttribute('data-open', 'true')
    const onClose = () => modal.removeAttribute('data-open')

    if (openBtn) openBtn.addEventListener('click', onOpen);
    if (closeBtn) closeBtn.addEventListener('click', onClose);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) onClose()
      })
    }

    return true
  }

  function initWithRetries(triesLeft) {
    if (initShareModal()) return
    if (triesLeft <= 0) return
    setTimeout(() => initWithRetries(triesLeft - 1), 250)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initWithRetries(12))
  } else {
    initWithRetries(12)
  }
})()

