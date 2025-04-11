document.addEventListener('DOMContentLoaded', function() {
    const cardGroups = [];
    const topCardTranslations = [];
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
                topCardTranslations.push(0); //Initialize 0 for the topCards for later use
            }
            else{
                console.log("Flex-Direction: Row");
            }
        } 
        else{
            console.warn(`Missing one or more elements for card group ${i}.`);
        }
    }

    console.log("Initialized bottomCardTranslations[]:",bottomCardTranslations); //log the bottomCardTranslations array after initializing
    console.log("Initialized topCardTranslations[]:", topCardTranslations); //log the topCardTranslations array after initializing

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

    //Align top-edge of bottomCard to bottom-edge of topCard (closed --> open)
    function matchTopToBottom(cardGroup){
        setNewTranslation(cardGroup);
        console.log("new topCardTranslations:", topCardTranslations);
        console.log("new bottomCardTranslations[]", bottomCardTranslations)
    }

    //Align bottom-edge of bottomCard to bottom-edge of topCard (open --> closed)
    function matchBottomToBottom(cardGroup){
    }

    function setNewTranslation(cardGroup){
        //if matchTopToBottom, (closed->open) the classList will contain 'open', translate the element down.
        if(cardGroup.bottomCard.classList.contains('open')){
            //The height of the bottomCard determines how much we have to translate it. Store the updated translation to help determine collision *before* translation
            bottomCardTranslations[cardGroup.index] += cardGroup.bottomCard.getBoundingClientRect().height;
            //Determine how many cards are being shifted by getting a total amount of recursion.
            const totalRecursions = checkForCollision(cardGroup);
            //Check if margins are still even
            setTimeout(function(){getMarginBottoms(cardGroups)},2200);
            //Translates the target element taking into account collision of other elements.
            translateElement(cardGroup, totalRecursions);
        }
        //else matchBottomToBottom, (open->closed), the class will have 'closed', translate the element up. (open->close)
        else{
            //...Coming soon
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

        //If true, recursion occurred until the end of the array
        if((cardGroup.index+totalRecursions) === (cardGroups.length-1)){    
            console.log("Recursion occurred until the last element.");
            for(let i = cardGroup.index; i < cardGroups.length; i++){
                cardGroups[i].bottomCard.style.transform = `translateY(${bottomCardTranslations[i]}px)`;
                cardGroups[i].bottomCard.style.transition = 'transform 2s ease-in';
                cardGroups[i].topCard.style.transform = `translateY(${topCardTranslations[i]}px)`;
                cardGroups[i].topCard.style.transition = 'transform 2s ease-in';
            }
            
        }
        /* KEEPING JUST IN CASE
        
        //Otherwise, recursion ended somewhere in the middle array.
        else{
            //Calculate how many elements until the end of the array
            let remainingElements = (cardGroups.length-1) - (cardGroup.index+totalRecursions);

            console.log("Recursion did NOT occur until the last element.");
            console.log(`cardGroup.index: ${cardGroup.index}, totalRecursions: ${totalRecursions}, Remaining Elements in cardGroups: ${remainingElements}`);
            
            for(let i = cardGroup.index; i <= cardGroup.index + totalRecursions; i++){
                cardGroups[i].bottomCard.style.transform = `translateY(${bottomCardTranslations[i]}px)`;
                cardGroups[i].bottomCard.style.transition = 'transform 2s ease-in';
                cardGroups[i].topCard.style.transform = `translateY(${topCardTranslations[i]}px)`;
                cardGroups[i].topCard.style.transition = 'transform 2s ease-in';
                //Logs what index the loop stopped on.
                if(i === cardGroup.index + totalRecursions){
                    console.log(`Last element-index translated: ${i}`);
                }
            }   
        }
        */
    }

    function checkForCollision(cardGroup, translationValue = 0, depth = 0){

        //stores the current bottomCard *bottom* position
        let currentBottomCardBottom = cardGroup.getBottomCardContainerPosition().bottom;

        console.log("The currentBottomCardBottom is", currentBottomCardBottom);
        console.log("The height of the currentBottomCard is", cardGroup.bottomCard.getBoundingClientRect().height);

        let newBottomCardBottom;
        if(!translationValue){
            //calculates and sets the future bottomCard *bottom* position 
            newBottomCardBottom = currentBottomCardBottom + cardGroup.bottomCard.getBoundingClientRect().height;
        }
        else{
            //calculates and sets the future bottomCard *bottom* position (recursion adjustment)
            console.log("The translation value is", translationValue);
            newBottomCardBottom = currentBottomCardBottom + translationValue;
        }

        console.log("The newBottomCardBottom is", newBottomCardBottom);

        if(cardGroups[cardGroup.index+1]){
            console.log("Next TopCard.top:", cardGroups[cardGroup.index+1].getTopCardContainerPosition().top);
        }

        //determines how many remaining elements are in cardGroups from the current index
        let remainingElements = cardGroups.slice(cardGroup.index).length - 1;

        if(!remainingElements){ //last index of cardGroups
            //True if this index was clicked; not called recursively.
            if(!translationValue){
                console.log("This is the initial call for the last element.");

                //True if matchTopToBottom is invoked (closed -> open)
                if(cardGroup.bottomCard.classList.contains('open')){
                    // INCORRECT IMPLEMENTATION, cannot be "bottomCardTranslations[cardGroup.index]" ---- that will include the *entire* translation, not just what should have been added.
                    // cardContainer.style.height = `${cardContainer.getBoundingClientRect().height + bottomCardTranslations[cardGroup.index]}px`;
                    
                    // CORRECT IMPLEMENTATION, sets the cardContainer height then returns to end the function from running further.
                    cardContainer.style.height = `${cardContainer.getBoundingClientRect().height + cardGroup.bottomCard.getBoundingClientRect().height}px`; 
                    return 0; //no recursions occurred.
                }
                else{ //cardGroup.bottomCard.classList.contains('closed')(open -> closed);
                    //Future Logic Here
                }
            } 
            //Invoked if it's a recursive call.
            else{
                console.log("This is a recursive call for the last element.");
                if(cardGroup.bottomCard.classList.contains('closed')){;
                    //Increase the height of the container to make way for the elements.
                    cardContainer.style.height = `${cardContainer.getBoundingClientRect().height + translationValue}px`;
                    //Update the translation values for topCards and bottomCards.
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

        //Not the last index
        else{
            //Logs the initial selected index
            if(depth===0){
                console.log("Initial Selected Index:", cardGroup.index);
            }
            else{
                console.log(`Recursive Index: ${depth}, cardGroup Index: ${cardGroup.index}, Next Index: ${cardGroup.index+1}`);
            }

            //True if (closed->open) bottomCard overlaps the next topCard
            if(newBottomCardBottom > cardGroups[cardGroup.index+1].getTopCardContainerPosition().top){
                //True if this is an initial call
                if(!translationValue){
                    console.log("They overlap, and this is the first call of checkForCollision for this sequence");
                    //This is the value which everything will translate downwards
                    translationValue = cardGroup.bottomCard.getBoundingClientRect().height;
                    //No translations array updates needed on initial calls.
                    return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth); 
                }
                //This is a recursive call
                else{
                    console.log("They overlap, and this is the subsequent (recursive) call of checkForCollision");
                    //Update the translation values for top and bottomCards. 
                    //Because the newBottomCardBottom overlaps the next cardGroup's topCard top-edge, we must move the element to accommodate, so we must also store it.
                    bottomCardTranslations[cardGroup.index] += translationValue;   
                    topCardTranslations[cardGroup.index] += translationValue;
                    return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth);
                }
            }
            //Else (closed->open) bottomCard does NOT overlap the next topCard
            else{
                //True if first call for checkForCollision
                if(!translationValue){
                    console.log("They do not overlap, and this is the first call of checkForCollision for this sequence.");
                    //Adjust elements below to maintain even margin-bottoms
                    translationValue = cardGroup.bottomCard.getBoundingClientRect().height;
                    //Check if margins are still even
                    setTimeout(function(){getMarginBottoms(cardGroups)},2200);
                    //No translations array updates needed on initial calls.
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
        //end of recursion, no return statements, any code can be executed here.
    }   

    function getMarginBottoms(cardGroups){
        for(let i = 0; i < cardGroups.length-1; i++){
            let marginBottom = Math.round(cardGroups[i+1].getTopCardContainerPosition().top - cardGroups[i].getBottomCardContainerPosition().bottom);
            console.log("marginBottom", marginBottom);
        }
    }
});

