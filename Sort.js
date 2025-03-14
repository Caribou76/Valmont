document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Script de gestion des produits chargé...");

    /** 🔍 LISTE DES PAGES AUTORISÉES **/
    const allowedPages = [
        "/category/products/",
        "/category/product-brand/",
        "/category/product-brand-bonif/",
        "/category/exclusive-offer/",
        "/global-search/",
    ];

    function isAllowedPage(path) {
        return allowedPages.some(page => path.includes(page));
    }

    let isSorting = false; // ✅ Empêche les boucles infinies
    let lastSortedHTML = ""; // ✅ Stocke la dernière version triée

    function runProductManagementScript() {
        const currentPath = window.location.pathname;
        if (!isAllowedPage(currentPath)) {
            console.log("🚫 Script désactivé sur cette page : " + currentPath);
            return;
        }

        console.log("✅ Script activé sur cette page : " + currentPath);

        const categoryOrder = ["Retail", "SPA", "Tester", "Gift", "Sample", "POS Materials"];
        const categoryColors = {
            "Retail": "#C39757",
            "SPA": "#346655",
            "Tester": "#363636",
            "Gift": "#902C2C",
            "Sample": "#363636",
            "POS Materials": "#005386"
        };

        function getCategory(element) {
            let categoryElement = Array.from(element.querySelectorAll(".c-searchProductField_searchProductField.slds-text-heading_small span"))
                .find(el => categoryOrder.includes(el.innerText.trim()));
            return categoryElement ? categoryElement.innerText.trim() : "Unknown";
        }

        function updateProductNames() {
            document.querySelectorAll(".c-searchProductCard_searchProductCard").forEach(card => {
                let productName = card.querySelector(".c-searchProductField_searchProductField.slds-text-heading_medium span");
                let category = getCategory(card);

                if (productName && category !== "Unknown") {
                    if (!productName.querySelector(".added-category")) {
                        let categorySpan = document.createElement("span");
                        categorySpan.className = "added-category";
                        categorySpan.style.color = categoryColors[category] || "#000";
                        categorySpan.style.fontWeight = "normal"; 
                        categorySpan.textContent = ` - ${category}`;
                        productName.appendChild(categorySpan);
                    }
                }
            });
        }

        function sortProducts(container) {
            if (isSorting) return; // ✅ Empêche les appels répétés
            isSorting = true;

            let items = Array.from(container.querySelectorAll(".grid-item"));
            if (items.length === 0) {
                console.warn("⚠️ Aucun produit trouvé pour le tri.");
                isSorting = false;
                return;
            }

            let categoryCounts = {};

            items.forEach(item => {
                let category = getCategory(item);
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;

                let name = item.querySelector(".c-searchProductField_searchProductField.slds-text-heading_medium span")?.innerText.trim() || "Nom inconnu";
                console.log(`🛒 Produit : ${name} - Catégorie détectée : ${category}`);
            });

            console.log("🔄 Avant tri :", items.map(el => el.innerText.trim()));

            items.sort((a, b) => {
                let categoryA = getCategory(a);
                let categoryB = getCategory(b);
                let nameA = a.querySelector(".c-searchProductField_searchProductField.slds-text-heading_medium span")?.innerText.trim().toLowerCase() || "";
                let nameB = b.querySelector(".c-searchProductField_searchProductField.slds-text-heading_medium span")?.innerText.trim().toLowerCase() || "";

                let indexA = categoryOrder.indexOf(categoryA);
                let indexB = categoryOrder.indexOf(categoryB);

                if (indexA === -1) indexA = categoryOrder.length;
                if (indexB === -1) indexB = categoryOrder.length;

                return indexA - indexB || nameA.localeCompare(nameB);
            });

            let sortedHTML = items.map(el => el.outerHTML).join("");

            // ✅ Vérifie si le tri a changé avant d'appliquer
            if (sortedHTML !== lastSortedHTML) {
                console.log("✅ Produits réorganisés !");
                container.replaceChildren(...items);
                lastSortedHTML = sortedHTML; // ✅ Mise à jour de l'état
            } else {
                console.log("✅ Aucun changement détecté, pas de modification.");
            }

            console.log("✅ Après tri :", items.map(el => el.innerText.trim()));
            console.log(`✅ Produits triés ! Catégories trouvées : `, JSON.stringify(categoryCounts, null, 2));

            isSorting = false; // ✅ Permet un nouveau tri si nécessaire
        }

        function processProductGrid() {
            let container = document.querySelector(".c-searchProductGrid_searchProductGrid");
            if (!container) {
                console.warn("⚠️ Conteneur de produits non trouvé, nouvel essai dans 500ms...");
                setTimeout(processProductGrid, 500);
                return;
            }

            updateProductNames();
            sortProducts(container);

            const observer = new MutationObserver(() => {
                console.log("🔄 Changement détecté, mise à jour en cours...");
                updateProductNames();
                sortProducts(container);
            });

            observer.observe(container, { childList: true, subtree: true });
            console.log("✅ Observateur activé pour détecter les changements.");
		}

        processProductGrid();
    }

    // Lancer le script au chargement initial
    runProductManagementScript();

    // ✅ **Détecter les changements d’URL en mode SPA (Salesforce B2B)**
    function detectNavigationChange() {
        let lastPath = window.location.pathname;
        const observer = new MutationObserver(() => {
            let currentPath = window.location.pathname;
            if (currentPath !== lastPath && isAllowedPage(currentPath)) {
                console.log("🔄 Navigation détectée, rechargement du script...");
                lastPath = currentPath;
                runProductManagementScript();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        console.log("✅ Observateur activé pour détecter les changements d'URL en mode SPA.");
    }

    detectNavigationChange();
});
