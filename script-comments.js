document.addEventListener('DOMContentLoaded', function() {
    const cardGroups = [];
    const topCards = document.querySelectorAll('#cardcontainer > .top-card');
    const cardContainer = document.getElementById('cardcontainer');

    //Set the margin-bottom of last top-card to 0
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
                    return getElementPosition(this.topCard); //returns position relative to document: {top: #px, bottom: #px}
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
                console.log(`Button ${dropTriggerId.split('-').pop()} clicked!------------------------------------------------------------`);

            });



            //Check if the cardContainer is set to flex-direction: column/row
            const computedStyle = window.getComputedStyle(cardContainer);
            if(computedStyle.flexDirection === 'column'){
                //Initialize the default position of each bottomCard
                cardGroups[i-1].bottomCard.style.transform = `translateY(${cardGroups[i-1].getTopCardContainerPosition().bottom - cardGroups[i-1].bottomCard.getBoundingClientRect().height}px)`;

                //Log how much each bottomCard was translated:
                console.log(`bottomCard${i} was translated ${cardGroups[i-1].getTopCardContainerPosition().bottom - cardGroups[i-1].bottomCard.getBoundingClientRect().height}px`);
            }
            else{
                console.log("Flex-Direction: Row");
            }

        } 
        else{
            console.warn(`Missing one or more elements for card group ${i}.`);
        }
    } //end of for loop
    
    console.log("topCard relative to container:",cardGroups[0].getTopCardContainerPosition());
    console.log("bottomCard relative to container:",cardGroups[0].getBottomCardContainerPosition());

    //The .bottom of the last topCard should be the same height as the cardContainer itself.
    console.log("current cardContainer height:", cardContainer.getBoundingClientRect().height);
    console.log("current topCard[2].bottom:",cardGroups[2].getTopCardContainerPosition().bottom);

    // Extend the height of the cardContainer relative to how much you plan on translating.
    // Should be using the bottomCard for this, not the topCard-- change in next commit

    //get height of container
    let a = cardContainer.getBoundingClientRect().height;   
    //store copy of the height value
    let b = a;
    //increase height of the container by *x* amount (hard-coded for now)
    a += 100;
    //get the difference in height, new - original
    b = a - b;
    //assign the new height to the container
    cardContainer.style.height = `${a}px`;
    
    //assign the difference in height as the amount to translate
    console.log(`translate element by ${b}px`);
    cardGroups[2].topCard.style.transform = `translateY(${b}px)`;
    console.log("topCard.bottom relative to container:", cardGroups[2].getTopCardContainerPosition().bottom);
    console.log("cardContainer height:",a);

});
