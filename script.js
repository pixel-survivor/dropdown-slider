document.addEventListener('DOMContentLoaded', function() {
    const cardGroups = [];
    const topCardTranslations = [];
    const bottomCardTranslations = [];
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
                toggleState(cardGroups[cardGroup.index]);
            });

            const computedStyle = window.getComputedStyle(cardContainer);
            if(computedStyle.flexDirection === 'column'){
                const translationValue = cardGroups[cardGroup.index].getTopCardContainerPosition().bottom - cardGroups[cardGroup.index].bottomCard.getBoundingClientRect().height;
                cardGroups[cardGroup.index].bottomCard.style.transform = `translateY(${translationValue}px)`;
                bottomCardTranslations.push(translationValue);
                topCardTranslations.push(0);

            }
            else{
                console.log("Flex-Direction: Row");
            }

        } 
        else{
            console.warn(`Missing one or more elements for card group ${i}.`);
        }
    }

    console.log("Initialized bottomCardTranslations[]:",bottomCardTranslations); 
    console.log("Initialized topCardTranslations[]:", topCardTranslations);

    function toggleState(cardGroup){
        if(cardGroup.bottomCard.classList.contains('closed')){
            console.log("Opening the card.....");
            cardGroup.bottomCard.classList.toggle('closed');
            cardGroup.bottomCard.classList.toggle('open');
            matchTopToBottom(cardGroup);
        }
        else{
            console.log("Closing the card.....");
            cardGroup.bottomCard.classList.toggle('open');
            cardGroup.bottomCard.classList.toggle('closed');
            matchBottomToBottom(cardGroup);
        }
    }

    function matchTopToBottom(cardGroup){
        setNewTranslation(cardGroup);
        console.log("new topCardTranslations:", topCardTranslations);
        console.log("new bottomCardTranslations[]", bottomCardTranslations)
    }

    function matchBottomToBottom(cardGroup){
    }

    function setNewTranslation(cardGroup){
        
        if(cardGroup.bottomCard.classList.contains('open')){
            bottomCardTranslations[cardGroup.index] += cardGroup.bottomCard.getBoundingClientRect().height;
            const totalRecursions = checkForCollision(cardGroup);
            setTimeout(function(){getMarginBottoms(cardGroups)},2200);
            translateElement(cardGroup, totalRecursions);
        }
        else{
        }
    }

    function translateElement(cardGroup, totalRecursions){

        console.log(`Total Recursions: ${totalRecursions}, Total calls for checkForCollisions: ${totalRecursions+1}`);

        if(totalRecursions === 0){
            console.log("No recursions were done.");
            cardGroup.bottomCard.style.transform = `translateY(${bottomCardTranslations[cardGroup.index]}px)`;
            cardGroup.bottomCard.style.transition = 'transform 2s ease-in';
            return;
        }

        if((cardGroup.index+totalRecursions) === (cardGroups.length-1)){    
            console.log("Recursion occurred until the last element.");
            for(let i = cardGroup.index; i < cardGroups.length; i++){
                cardGroups[i].bottomCard.style.transform = `translateY(${bottomCardTranslations[i]}px)`;
                cardGroups[i].bottomCard.style.transition = 'transform 2s ease-in';
                cardGroups[i].topCard.style.transform = `translateY(${topCardTranslations[i]}px)`;
                cardGroups[i].topCard.style.transition = 'transform 2s ease-in';
            }
            
        }
    }

    function checkForCollision(cardGroup, translationValue = 0, depth = 0){

        let currentBottomCardBottom = cardGroup.getBottomCardContainerPosition().bottom;

        console.log("The currentBottomCardBottom is", currentBottomCardBottom);
        console.log("The height of the currentBottomCard is", cardGroup.bottomCard.getBoundingClientRect().height);

        let newBottomCardBottom;
        if(!translationValue){
            newBottomCardBottom = currentBottomCardBottom + cardGroup.bottomCard.getBoundingClientRect().height;
        }
        else{
            console.log("The translation value is", translationValue);
            newBottomCardBottom = currentBottomCardBottom + translationValue;
        }

        console.log("The newBottomCardBottom is", newBottomCardBottom);

        if(cardGroups[cardGroup.index+1]){
            console.log("Next TopCard.top:", cardGroups[cardGroup.index+1].getTopCardContainerPosition().top);
        }

        let remainingElements = cardGroups.slice(cardGroup.index).length - 1;

        if(!remainingElements){
            if(!translationValue){
                console.log("This is the initial call for the last element.");
                if(cardGroup.bottomCard.classList.contains('open')){
                    cardContainer.style.height = `${cardContainer.getBoundingClientRect().height + cardGroup.bottomCard.getBoundingClientRect().height}px`; 
                    return 0;
                }
                else{ 
                }
            } 
            else{
                console.log("This is a recursive call for the last element.");
                if(cardGroup.bottomCard.classList.contains('closed')){;
                    cardContainer.style.height = `${cardContainer.getBoundingClientRect().height + translationValue}px`;
                    bottomCardTranslations[cardGroup.index] += translationValue;
                    topCardTranslations[cardGroup.index] += translationValue; 
                    return depth;
                }
                
                else{
                    cardContainer.style.height = `${cardContainer.getBoundingClientRect().height + translationValue}px`;
                    bottomCardTranslations[cardGroup.index] += translationValue;
                    topCardTranslations[cardGroup.index] += translationValue; 
                    return depth;
                }
            }
        }

        else{
            if(depth===0){
                console.log("Initial Selected Index:", cardGroup.index);
            }
            else{
                console.log(`Recursive Index: ${depth}, cardGroup Index: ${cardGroup.index}, Next Index: ${cardGroup.index+1}`);
            }

            if(newBottomCardBottom > cardGroups[cardGroup.index+1].getTopCardContainerPosition().top){
                if(!translationValue){
                    console.log("They overlap, and this is the first call of checkForCollision for this sequence");
                    translationValue = cardGroup.bottomCard.getBoundingClientRect().height;
                    return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth); 
                }
                else{
                    console.log("They overlap, and this is the subsequent (recursive) call of checkForCollision");
                    bottomCardTranslations[cardGroup.index] += translationValue;   
                    topCardTranslations[cardGroup.index] += translationValue;
                    return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth);
                }
            }
            else{
                if(!translationValue){
                    console.log("They do not overlap, and this is the first call of checkForCollision for this sequence.");
                    translationValue = cardGroup.bottomCard.getBoundingClientRect().height;
                    setTimeout(function(){getMarginBottoms(cardGroups)},2200);
                    return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth);
                } 
                else{
                    console.log("They do not overlap, and this is a subsequent (recursive) call of checkForCollision."); 
                    bottomCardTranslations[cardGroup.index] += translationValue;   
                    topCardTranslations[cardGroup.index] += translationValue;
                    return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth);
                }
            }
        }
    }   

    function getMarginBottoms(cardGroups){
        for(let i = 0; i < cardGroups.length-1; i++){
            let marginBottom = Math.round(cardGroups[i+1].getTopCardContainerPosition().top - cardGroups[i].getBottomCardContainerPosition().bottom);
            console.log("marginBottom", marginBottom);
        }
    }
});

