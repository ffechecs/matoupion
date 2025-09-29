import { nextTick } from 'vue';

export function animateInstructionTransition(sourceElement: HTMLElement, targetElement: HTMLElement | null) {
  if (!sourceElement || !targetElement) return;

  // Créer une copie du texte source
  const flyingText = document.createElement('p');
  flyingText.textContent = sourceElement.textContent || '';
  flyingText.style.position = 'fixed';
  
  // Obtenir les positions
  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();
  
  // Positionner le texte volant
  flyingText.style.left = `${sourceRect.left}px`;
  flyingText.style.top = `${sourceRect.top}px`;
  flyingText.style.width = `${sourceRect.width}px`;
  flyingText.style.margin = '0';
  flyingText.style.transition = 'all 0.5s ease-in-out';
  
  // Ajouter au body (pas au parent)
  document.body.appendChild(flyingText);
  
  // Forcer un reflow
  flyingText.offsetHeight;
  
  // Animer vers la destination
  flyingText.style.left = `${targetRect.left}px`;
  flyingText.style.top = `${targetRect.top}px`;
  flyingText.style.width = `${targetRect.width}px`;
  
  // Nettoyer après l'animation
  flyingText.addEventListener('transitionend', () => {
    if (flyingText.parentNode === document.body) {
      document.body.removeChild(flyingText);
    }
  });
} 
