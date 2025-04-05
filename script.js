document.addEventListener('DOMContentLoaded', function() {
    const cardGroups = [];
    const topCards = document.querySelectorAll('#cardcontainer > .top-card');
    const cardContainer = document.getElementById('cardcontainer');

    if(topCards.length > 0){
        const lastTopCard = topCards[topCards.length-1];
        lastTopCard.style.marginBottom = '0px';
    }

    function getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        return {
            top: rect.top + scrollTop,
            bottom: rect.bottom + scrollTop,
        };
    }

    function getTranslation(element){
        const style = window.getComputedStyle(element);
        const transformValue = style.transform || style.webkitTransform || style.mozTransform;

        if (!transformValue || transformValue === 'none') {
            return { x: 0, y: 0 };
        }

        const matrix = transformValue.match(/matrix.*\((.+)\)/)?.[1]?.split(', ') || [];

        if (matrix.length === 6) {
            // 2D transform
            return {
            x: parseFloat(matrix[4]) || 0,
            y: parseFloat(matrix[5]) || 0,
            };
        } else if (matrix.length === 16) {
            // 3D transform
            return {
            x: parseFloat(matrix[12]) || 0,
            y: parseFloat(matrix[13]) || 0,
            z: parseFloat(matrix[14]) || 0,
            };
        }

        return { x: 0, y: 0 };
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
                console.log(cardGroups[i-1].topCard);

                let a = getTranslation(cardGroups[i-1].bottomCard).y;
                console.log("current translation:",a);
                a += 50;
                cardGroups[i-1].bottomCard.style.transform = `translateY(${a}px)`;
                console.log("new translation:",a);
                console.log(getTranslation(cardGroups[i-1].bottomCard));
            });

            const computedStyle = window.getComputedStyle(cardContainer);
            if(computedStyle.flexDirection === 'column'){
                cardGroups[i-1].bottomCard.style.transform = `translateY(${cardGroups[i-1].getTopCardContainerPosition().bottom - cardGroups[i-1].bottomCard.getBoundingClientRect().height}px)`;
                console.log(`${cardGroups[i-1].getTopCardContainerPosition().bottom - cardGroups[i-1].bottomCard.getBoundingClientRect().height}`);
            }
            else{
                console.log("Flex-Direction: Row");
            }

        } 
        else{
            console.warn(`Missing one or more elements for card group ${i}.`);
        }
    }
});
