if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('pitch-enter')
      observer.unobserve(entry.target)
    }
  }, { threshold: 0.1 })

  for (const block of document.querySelectorAll('.pitch header, .pitch-card, .pitch-values, .pitch-intro, .pitch-inline-action')) {
    observer.observe(block)
  }
}
