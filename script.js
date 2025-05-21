document.addEventListener('DOMContentLoaded', function(){
    const cardGroups = [];
    const topCardTranslations = [];
    const bottomCardTranslations = [];
    const topCards = document.querySelectorAll('#cardcontainer > .top-card');
    const cardContainer = document.getElementById('cardcontainer');

    const ANIMATION_DURATION = 1400; 
    const CLIP_PATH_DURATION = 1200; 
    const EASING = 'cubic-bezier(0.25, 1, 0.5, 1)'; 

    const cardTransition = `transform ${ANIMATION_DURATION}ms ${EASING}`;
    const clipTransition = `clip-path ${CLIP_PATH_DURATION}ms ${EASING}`;
    const containerTransition = `height ${ANIMATION_DURATION}ms ${EASING}`;

    if(topCards.length > 0){
        const lastTopCard = topCards[topCards.length-1];
        lastTopCard.style.marginBottom = '0px';
    }

    function getElementPosition(element){
        const rect = element.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        return{
            top: rect.top + scrollTop,
            bottom: rect.bottom + scrollTop,
        };
    }

    for (let i = 1; i <= topCards.length; i++){
        const topCardId = `top-card-${i}`;
        const bottomCardId = `bottom-card-${i}`;
        const dropTriggerId = `drop-trigger-${i}`;

        const topCard = document.getElementById(topCardId);
        const bottomCard = document.getElementById(bottomCardId);
        const dropTrigger = document.getElementById(dropTriggerId);

        if(topCard && bottomCard && dropTrigger){
            const cardGroup = {
                topCard: topCard,
                bottomCard: bottomCard,
                dropTrigger: dropTrigger,
                index: i - 1,
                getTopCardPosition: function(){
                    return getElementPosition(this.topCard);
                },
                getTopCardContainerPosition: function(){
                    return{
                        top: this.getTopCardPosition().top - getElementPosition(cardContainer).top,
                        bottom: this.getTopCardPosition().bottom - getElementPosition(cardContainer).top,
                    };
                },
                getBottomCardPosition: function(){
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

            dropTrigger.addEventListener('click', function(){
                console.log(`Button ${dropTriggerId.split('-').pop()} clicked!`);
                toggleState(cardGroups[cardGroup.index]);
            });

            const computedStyle = window.getComputedStyle(cardContainer);
            if(computedStyle.flexDirection === 'column'){
                bottomCard.classList.add('closed');
                
                const translationValue = cardGroups[cardGroup.index].getTopCardContainerPosition().bottom - cardGroups[cardGroup.index].bottomCard.getBoundingClientRect().height;
                
                cardGroup.bottomCard.style.transition = 'none';
                cardGroup.bottomCard.style.transform = `translateY(${translationValue}px)`;
                
                setTimeout(() => {
                    cardGroup.bottomCard.style.transition = `${cardTransition}, ${clipTransition}`;
                    cardGroup.topCard.style.transition = cardTransition;
                }, 0);
                const clipAmount = calculateClipAmount(cardGroup);
                cardGroup.bottomCard.style.clipPath = `inset(${clipAmount}px 0 0 0)`;

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

    function calculateClipAmount(cardGroup){
        const topCardHeight = cardGroup.topCard.getBoundingClientRect().height;
        const bottomCardHeight = cardGroup.bottomCard.getBoundingClientRect().height;
        
        if(cardGroup.bottomCard.classList.contains('closed')){
            return bottomCardHeight - topCardHeight > 0 ? bottomCardHeight - topCardHeight : 0;
        } 
        else{
            return 0;
        }
    }

    console.log("Initialized bottomCardTranslations[]:",bottomCardTranslations); 
    console.log("Initialized topCardTranslations[]:", topCardTranslations);

    function toggleState(cardGroup){
        cardGroup.dropTrigger.disabled = true;
        const initialCardHeights = storeInitialHeights();
        
        const isOpening = cardGroup.bottomCard.classList.contains('closed');
        
        if(isOpening){
            console.log("Opening the card...");
            cardGroup.bottomCard.classList.remove('closed');
            cardGroup.bottomCard.classList.add('open');
            expandCard(cardGroup, initialCardHeights);
        } 
        else{
            console.log("Closing the card...");
            cardGroup.bottomCard.classList.remove('open');
            cardGroup.bottomCard.classList.add('closed');
            collapseCard(cardGroup, initialCardHeights);
        }
        
        setTimeout(() => {
            cardGroup.dropTrigger.disabled = false;
        }, ANIMATION_DURATION);
    }
    
    function storeInitialHeights(){
        const heights = {};
        cardGroups.forEach(group => {
            const index = group.index;
            heights[`top-${index}`] = group.topCard.getBoundingClientRect().height;
            heights[`bottom-${index}`] = group.bottomCard.getBoundingClientRect().height;
        });
        return heights;
    }
    
    function expandCard(cardGroup, initialHeights) {
        const bottomCardHeight = initialHeights[`bottom-${cardGroup.index}`];
        bottomCardTranslations[cardGroup.index] += bottomCardHeight;
        
        const totalRecursions = checkForCollision(cardGroup);
        animateClipPath(cardGroup, true);
        translateElement(cardGroup, totalRecursions);
        
        setTimeout(() => {
            getMarginBottoms(cardGroups);
        }, ANIMATION_DURATION + 100);
    }
    
    function collapseCard(cardGroup, initialHeights){
        const bottomCardHeight = initialHeights[`bottom-${cardGroup.index}`];
        bottomCardTranslations[cardGroup.index] -= bottomCardHeight;
        
        const totalRecursions = collapseElements(cardGroup);
        
        animateClipPath(cardGroup, false);
        translateElement(cardGroup, totalRecursions);
    }

    function translateElement(cardGroup, totalRecursions){
        if(totalRecursions === 0){
            cardGroup.bottomCard.style.transform = `translateY(${bottomCardTranslations[cardGroup.index]}px)`;
            return;
        }
        if((cardGroup.index + totalRecursions) >= (cardGroups.length - 1)){
            for (let i = cardGroup.index; i < cardGroups.length; i++){
                cardGroups[i].bottomCard.style.transform = `translateY(${bottomCardTranslations[i]}px)`;
                cardGroups[i].topCard.style.transform = `translateY(${topCardTranslations[i]}px)`;
            }
            return;
        }
        
        for (let i = cardGroup.index; i <= cardGroup.index + totalRecursions; i++){
            cardGroups[i].bottomCard.style.transform = `translateY(${bottomCardTranslations[i]}px)`;
            if(i > cardGroup.index){
                cardGroups[i].topCard.style.transform = `translateY(${topCardTranslations[i]}px)`;
            }
        }
    }

    function checkForCollision(cardGroup, translationValue = 0, depth = 0){
        const currentBottomCardBottom = cardGroup.getBottomCardContainerPosition().bottom;
        const bottomCardHeight = cardGroup.bottomCard.getBoundingClientRect().height;
        
        let newBottomCardBottom = translationValue ? 
            currentBottomCardBottom + translationValue : 
            currentBottomCardBottom + bottomCardHeight;
        
        const remainingElements = cardGroups.slice(cardGroup.index).length - 1;

        if(remainingElements === 0){
            if(!translationValue){
                if(cardGroup.bottomCard.classList.contains('open')){
                    updateContainerHeight(cardContainer, bottomCardHeight);
                    return 0;
                }
                return 0;
            } 
            else{
                updateContainerHeight(cardContainer, translationValue);
                
                bottomCardTranslations[cardGroup.index] += translationValue;
                topCardTranslations[cardGroup.index] += translationValue;
                return depth;
            }
        }
        
        const nextCardTop = cardGroups[cardGroup.index + 1].getTopCardContainerPosition().top;
        
        if(newBottomCardBottom > nextCardTop){
            if(!translationValue){
                translationValue = bottomCardHeight;
                return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth);
            } 
            else{
                bottomCardTranslations[cardGroup.index] += translationValue;
                topCardTranslations[cardGroup.index] += translationValue;
                return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth);
            }
        } 
        else{
            if(!translationValue){
                translationValue = bottomCardHeight;
                return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth);
            } 
            else{
                bottomCardTranslations[cardGroup.index] += translationValue;
                topCardTranslations[cardGroup.index] += translationValue;
                return checkForCollision(cardGroups[cardGroup.index + 1], translationValue, ++depth);
            }
        }
    }

    function collapseElements(cardGroup){
        const bottomCardHeight = cardGroup.bottomCard.getBoundingClientRect().height;
        const remainingElements = cardGroups.slice(cardGroup.index).length - 1;

        if(remainingElements === 0){
            updateContainerHeight(cardContainer, -bottomCardHeight);
            return 0;
        } 
        else{
            let depth = 0;
            for (let i = 1; i <= remainingElements; i++){
                let index = cardGroup.index + i;
                bottomCardTranslations[index] -= bottomCardHeight;
                topCardTranslations[index] -= bottomCardHeight;
                depth++;
                
                if(i === remainingElements){
                    updateContainerHeight(cardContainer, -bottomCardHeight);
                }
            }
            return depth;
        }
    }
    function updateContainerHeight(container, heightChange){
        const currentHeight = container.getBoundingClientRect().height;
        container.style.height = `${currentHeight}px`;
        container.style.transition = containerTransition;
        
        requestAnimationFrame(() => {
            container.style.height = `${currentHeight + heightChange}px`;
        });
    }

    function getMarginBottoms(cardGroups){
        for(let i = 0; i < cardGroups.length-1; i++){
            let marginBottom = Math.round(cardGroups[i+1].getTopCardContainerPosition().top - cardGroups[i].getBottomCardContainerPosition().bottom);
            console.log("marginBottom", marginBottom);
        }
    }

    function animateClipPath(cardGroup, isOpening){
        const bottomCard = cardGroup.bottomCard;
        const topCard = cardGroup.topCard;
        const bottomCardHeight = bottomCard.getBoundingClientRect().height;
        const topCardHeight = topCard.getBoundingClientRect().height;
        const clipAmount = Math.max(0, bottomCardHeight - topCardHeight);
        
        if(isOpening){
            bottomCard.style.clipPath = `inset(${clipAmount}px 0 0 0)`;
            requestAnimationFrame(() => {
                bottomCard.style.clipPath = 'inset(0 0 0 0)';
            });
        } 
        else{
            bottomCard.style.clipPath = 'inset(0 0 0 0)';
            requestAnimationFrame(() => {
                bottomCard.style.clipPath = `inset(${clipAmount}px 0 0 0)`;
            });
        }
    }
});