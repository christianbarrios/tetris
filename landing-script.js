document.addEventListener('DOMContentLoaded', () => {
    const mainTitle = document.getElementById('main-title');
    const descriptionText = document.getElementById('description-text');
    const benefitsTitle = document.getElementById('benefits-title');
    const benefitsList = document.getElementById('benefits-list');
    const startButton = document.getElementById('start-button');

    // Contenido en diferentes idiomas
// ... (código existente) ...

    const content = {
        es: {
            title: "¡Bienvenido a Tetris Classic!",
            description: "¡Redescubre el clásico juego que ha entretenido a millones de personas en todo el mundo! Tetris es más que un simple juego; es un desafío para tu mente.",
            benefitsTitle: "¿Sabías que jugar Tetris puede ser beneficioso para tu cerebro? Según expertos, este juego puede:",
            benefits: [
                "Mejorar la agudeza mental, la concentración y la capacidad de resolución de problemas.",
                "Ayudar a reducir el estrés y la ansiedad.",
                "Disminuir los recuerdos intrusivos o flashbacks después de eventos traumáticos, ya que compite por los recursos visuales y espaciales del cerebro."
            ],
            startButton: "Jugar Ahora"
        },
        en: {
            title: "Welcome to Tetris Classic!",
            description: "Rediscover the classic game that has entertained millions worldwide! Tetris is more than just a game; it's a challenge for your mind.",
            benefitsTitle: "Did you know playing Tetris can be beneficial for your brain? According to experts, this game can:",
            benefits: [
                "Improve mental acuity, concentration, and problem-solving skills.",
                "Help reduce stress and anxiety.",
                "Decrease intrusive memories or flashbacks after a traumatic event, by competing for the brain's visual and spatial resources."
            ],
            startButton: "Play Now"
        }
    };

// ... (resto del código) ...

    // Detectar el idioma del navegador (p. ej., 'es-ES' o 'en-US')
    const userLang = navigator.language.split('-')[0];
    const lang = content[userLang] ? userLang : 'en'; // Usar inglés por defecto

    // Cargar el contenido
    mainTitle.textContent = content[lang].title;
    descriptionText.textContent = content[lang].description;
    benefitsTitle.textContent = content[lang].benefitsTitle;
    startButton.textContent = content[lang].startButton;

    content[lang].benefits.forEach(benefit => {
        const li = document.createElement('li');
        li.textContent = benefit;
        benefitsList.appendChild(li);
    });
});