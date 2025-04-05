document.addEventListener('DOMContentLoaded', function() {
    const cardGroups = [];
    const bottomCardTranslations = [];
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
                index: i - 1,
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

                console.log(`Button ${dropTriggerId.split('-').pop()} clicked!`);
                toggleState(cardGroups[cardGroup.index]);
            });



            //Check if the cardContainer is set to flex-direction: column/row
            const computedStyle = window.getComputedStyle(cardContainer);
            if(computedStyle.flexDirection === 'column'){
                //Initialize the default position of each bottomCard
                const translationValue = cardGroups[cardGroup.index].getTopCardContainerPosition().bottom - cardGroups[cardGroup.index].bottomCard.getBoundingClientRect().height;
                cardGroups[cardGroup.index].bottomCard.style.transform = `translateY(${translationValue}px)`;

                //Push the translationValue for later changes
                bottomCardTranslations.push(translationValue);

                //Log how much each bottomCard was translated:
                console.log(`${cardGroups[cardGroup.index].getTopCardContainerPosition().bottom - cardGroups[cardGroup.index].bottomCard.getBoundingClientRect().height}`);
            }
            else{
                console.log("Flex-Direction: Row");
            }

        } 
        else{
            console.warn(`Missing one or more elements for card group ${i}.`);
        }
    }

    console.log("bottomCardTranslations[]:",bottomCardTranslations); //simply log the bottomCardTranslations as an array

    function toggleState(cardGroup){
        if(cardGroup.bottomCard.classList.contains('closed')){
            console.log("Opening...");
            cardGroup.bottomCard.classList.toggle('closed');
            cardGroup.bottomCard.classList.toggle('open');

            matchTopToBottom(cardGroup);
        }
        else{
            console.log("Closing...");
            cardGroup.bottomCard.classList.toggle('open');
            cardGroup.bottomCard.classList.toggle('closed');

            matchBottomToBottom(cardGroup);
        }
    }


    //Align top-edge of bottomCard to bottom-edge of topCard
    function matchTopToBottom(cardGroup){
        // console.log('opened');
        let currentTranslation = bottomCardTranslations[cardGroup.index];
        console.log("Initial, Closed and Current Translation:", currentTranslation);
        currentTranslation += cardGroup.bottomCard.getBoundingClientRect().height;
        cardGroup.bottomCard.style.transform = `translateY(${currentTranslation}px)`;
        bottomCardTranslations[cardGroup.index] = currentTranslation;
        cardGroup.bottomCard.style.transition = 'transform 3s ease-in';
        console.log("bottomCardTranslations[]:",bottomCardTranslations);
    }

    //Align bottom-edge of bottomCard to bottom-edge of topCard
    function matchBottomToBottom(cardGroup){
        // console.log('closed');
        let currentTranslation = bottomCardTranslations[cardGroup.index];
        console.log("Open and Current Translation", currentTranslation);
        let newTranslation = currentTranslation - cardGroup.bottomCard.getBoundingClientRect().height;
        cardGroup.bottomCard.style.transform = `translateY(${newTranslation}px)`;
        bottomCardTranslations[cardGroup.index] = newTranslation;
        cardGroup.bottomCard.style.transition = 'transform 3s ease-in';
        console.log("bottomCardTranslations[]:",bottomCardTranslations);
    }
});
