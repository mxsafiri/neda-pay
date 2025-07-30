import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Animate balance number counting up/down
 */
export const animateBalanceCount = (
  element: HTMLElement | null,
  from: number,
  to: number,
  duration: number = 1.5
) => {
  if (!element) return

  gsap.fromTo(element, 
    { 
      textContent: from.toLocaleString(),
      scale: 0.95
    },
    { 
      textContent: to.toLocaleString(),
      scale: 1,
      duration,
      ease: "power2.out",
      snap: { textContent: 1 },
      onUpdate: function() {
        const currentValue = Math.round(this.targets()[0].textContent.replace(/,/g, ''))
        element.textContent = currentValue.toLocaleString()
      }
    }
  )
}

/**
 * Smooth page transition animation
 */
export const animatePageTransition = (element: HTMLElement | null) => {
  if (!element) return

  gsap.fromTo(element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
  )
}

/**
 * Button hover micro-interaction
 */
export const animateButtonHover = (element: HTMLElement | null, isHover: boolean) => {
  if (!element) return

  gsap.to(element, {
    scale: isHover ? 1.05 : 1,
    duration: 0.2,
    ease: "power2.out"
  })
}

/**
 * Currency toggle animation
 */
export const animateCurrencyToggle = (element: HTMLElement | null) => {
  if (!element) return

  gsap.to(element, {
    rotationY: 360,
    duration: 0.6,
    ease: "power2.out"
  })
}

/**
 * Loading spinner animation
 */
export const animateLoadingSpinner = (element: HTMLElement | null) => {
  if (!element) return

  gsap.to(element, {
    rotation: 360,
    duration: 1,
    ease: "none",
    repeat: -1
  })
}

/**
 * Success checkmark animation
 */
export const animateSuccess = (element: HTMLElement | null) => {
  if (!element) return

  gsap.fromTo(element,
    { scale: 0, opacity: 0 },
    { 
      scale: 1, 
      opacity: 1, 
      duration: 0.5, 
      ease: "back.out(1.7)",
      onComplete: () => {
        gsap.to(element, {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        })
      }
    }
  )
}

/**
 * Card reveal animation for scroll
 */
export const animateCardReveal = (element: HTMLElement | null) => {
  if (!element || typeof window === 'undefined') return

  gsap.fromTo(element,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    }
  )
}

/**
 * Stagger animation for multiple elements
 */
export const animateStagger = (elements: NodeListOf<Element> | Element[]) => {
  if (!elements || elements.length === 0) return

  gsap.fromTo(elements,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    }
  )
}

/**
 * Balance circle pulse animation
 */
export const animateBalanceCirclePulse = (element: HTMLElement | null) => {
  if (!element) return

  gsap.to(element, {
    scale: 1.02,
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "power2.inOut"
  })
}
