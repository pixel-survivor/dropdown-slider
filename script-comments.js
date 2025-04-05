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
                    return getElementPosition(this.topCard); //returns position relative to document: {top: #px, bottom: #px}
                },
                getTopCardContainerPosition: function(){
                    return{
                        top: this.getTopCardPosition().top - getElementPosition(cardContainer).top,
                        bottom: this.getTopCardPosition().bottom - getElementPosition(cardContainer).top
                    };
                },
                getBottomCardPosition: function() {
                    return getElementPosition(this.bottomCard);
                },
                getBottomCardContainerPosition: function(){
                    return{
                        top: this.getBottomCardPosition().top - getElementPosition(cardContainer).top,
                        bottom: this.getBottomCardPosition().bottom - getElementPosition(cardContainer).top
                    };
                },
            };

            cardGroups.push(cardGroup);

            dropTrigger.addEventListener('click', function() {
                console.log(`Button ${dropTriggerId.split('-').pop()} clicked!`);
            });
        } else {
            console.warn(`Missing one or more elements for card group ${i}.`);
        }
    }

    function logDebugger(cardGroup){

        console.log("container height:", cardContainer.getBoundingClientRect().height);
        console.log("container position(relative to doc):", getElementPosition(cardContainer));

        console.log('---\n---\n---');

        const topCard = cardGroup.getTopCardPosition();
        console.log(`topCard top-edge is ${topCard.top}px from the top of the document`);
        console.log(`topCard bottom-edge is ${topCard.bottom}px from the top of the document`);

        const bottomCard = cardGroup.getBottomCardPosition();
        console.log(`bottomCard top-edge is ${bottomCard.top}px from the top of the document`);
        console.log(`bottomCard bottom-edge is ${bottomCard.bottom}px from the top of the document`);

        console.log('---\n---\n---');

        const topCardContainer = cardGroup.getTopCardContainerPosition();
        console.log(`topCard top-edge is ${topCardContainer.top}px from the top of the container`);
        console.log(`topCard bottom-edge is ${topCardContainer.bottom}px from the top of the container`);

        const bottomCardContainer = cardGroup.getBottomCardContainerPosition();
        console.log(`bottomCard top-edge is ${bottomCardContainer.top}px from the top of the container`);
        console.log(`bottomCard bottom-edge is ${bottomCardContainer.bottom}px from the top of the container`);

        console.log('---\n---\n---');
    }
    
    logDebugger(cardGroups[0]);


    //Aligns bottomedges of bottomCard[2] to topCard[2] -------------

    //This line aligns the top of the bottomCard to the bottom of the topCard
    cardGroups[2].bottomCard.style.top = `${cardGroups[2].getTopCardContainerPosition().bottom}px`;
    //This line translates the bottomCard upward equivalent to its height.
    cardGroups[2].bottomCard.style.transform = `translateY(-${cardGroups[2].bottomCard.getBoundingClientRect().height}px)`
    //This line simply logs the height of the bottomCard being translated:
    console.log("bottomCard Height:", cardGroups[2].bottomCard.getBoundingClientRect().height);
    //---------------------------------------------------------------


    /*Default Position Formula: ------------------------------------
    // alternative two lines:
    // let answer = cardGroups[1].getTopCardContainerPosition().bottom - cardGroups[1].bottomCard.getBoundingClientRect().height;
    // cardGroups[1].bottomCard.style.top = `${answer}px`;*/

    //alternative single line:
    cardGroups[1].bottomCard.style.top = `${cardGroups[1].getTopCardContainerPosition().bottom - cardGroups[1].bottomCard.getBoundingClientRect().height}px`;
    //---------------------------------------------------------------
});
