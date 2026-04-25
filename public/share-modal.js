(() => {
  function initShareModal() {
    const modal = document.querySelector('[data-share-modal]')
    const openBtn = document.querySelector('[data-share-modal-open]')
    const closeBtn = document.querySelector('[data-share-modal-close]')

    if (!modal || !openBtn || !closeBtn) return

    const onOpen = () => modal.setAttribute('data-open', 'true')
    const onClose = () => modal.removeAttribute('data-open')

    openBtn.addEventListener('click', onOpen)
    closeBtn.addEventListener('click', onClose)

    modal.addEventListener('click', (e) => {
      if (e.target === modal) onClose()
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareModal)
  } else {
    initShareModal()
  }
})()

