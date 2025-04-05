document.addEventListener('DOMContentLoaded', function() {
    const cardGroups = [];
    const topCards = document.querySelectorAll('.top-card');
    const cardContainer = document.getElementById('cardcontainer');

    function getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        return {
            top: rect.top + scrollTop,
            bottom: rect.bottom + scrollTop,
        };
    }

    for (let i = 1; i <= topCards.length; i++) {
        const topCardId = `top-card-${i}`;
        const bottomCardId = `bottom-card-${i}`;
        const dropTriggerId = `drop-trigger-${i}`;

        const topCard = document.getElementById(topCardId);
        const bottomCard = document.getElementById(bottomCardId);
        const dropTrigger = document.getElementById(dropTriggerId);

        if (topCard && bottomCard && dropTrigger) {
            const cardGroup = {
                topCard: topCard,
                bottomCard: bottomCard,
                dropTrigger: dropTrigger,
                getTopCardPosition: function() {
                    return getElementPosition(this.topCard);
                },
                getTopCardContainerPosition: function(){
                    return{
                        top: this.getTopCardPosition().top - getElementPosition(cardContainer).top,
                        bottom: this.getTopCardPosition().bottom - getElementPosition(cardContainer).top,
                    };
                },
                getBottomCardPosition: function() {
                    return getElementPosition(this.bottomCard);
                },
                getBottomCardContainerPosition: function(){
                    return{
                        top: this.getBottomCardPosition().top - getElementPosition(cardContainer).top,
                        bottom: this.getBottomCardPosition().bottom - getElementPosition(cardContainer).top,
                    };
                },
            };

            cardGroups.push(cardGroup);

            dropTrigger.addEventListener('click', function() {
                console.log(`Button ${dropTriggerId.split('-').pop()} clicked!`);
            });

            cardGroups[i-1].bottomCard.style.transform = `translateY(${cardGroups[i-1].getTopCardContainerPosition().bottom - cardGroups[i-1].bottomCard.getBoundingClientRect().height}px)`;

        } else {
            console.warn(`Missing one or more elements for card group ${i}.`);
        }
    }
});
