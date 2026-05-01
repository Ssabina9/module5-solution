(function(angular) {
  'use strict';

  angular.module('restaurant', [])
    .controller('RestaurantController', RestaurantController);

  RestaurantController.$inject = ['$http', '$compile', '$scope'];
  function RestaurantController($http, $compile, $scope) {
    var $ctrl = this;
    var mainView = angular.element(document.querySelector('#main-view'));
    var loadingView = angular.element(document.querySelector('#loading-view'));

    // Басты бетті жүктеу
    $ctrl.loadHome = function() {
      loadingView.css('display', 'block');
      mainView.empty();

      // 1. Home snippet жүктеу
      $http.get('snippets/home-snippet.html')
        .then(function(response) {
          var homeHtml = response.data;
          
          // 2. GET - Барлық категорияларды алу
          return $http.get('https://coursera-jhu-default-rtdb.firebaseio.com/categories.json')
            .then(function(categoryResponse) {
              var categories = categoryResponse.data;
              
              // 3. Кездейсоқ категория таңдау
              var randomIndex = Math.floor(Math.random() * categories.length);
              var randomCategoryShortName = categories[randomIndex].short_name;
              
              // 4. Placeholder-ды ауыстыру
              var updatedHtml = homeHtml.replace('{{randomCategoryShortName}}', "'" + randomCategoryShortName + "'");
              
              return updatedHtml;
            });
        })
        .then(function(updatedHtml) {
          // 5. HTML компиляциялау
          var compiledHtml = $compile(updatedHtml)($scope);
          mainView.append(compiledHtml);
          loadingView.css('display', 'none');
        })
        .catch(function(error) {
          console.error('Error:', error);
          loadingView.css('display', 'none');
          mainView.html('<div class="error">Қате кетті!</div>');
        });
    };

    // Мәзір элементтерін жүктеу
    $ctrl.loadMenuItems = function(categoryShortName) {
      loadingView.css('display', 'block');
      mainView.empty();

      // 1. Single category шаблонын жүктеу
      $http.get('snippets/singlecategory.html')
        .then(function(response) {
          var categoryHtml = response.data;
          
          // 2. GET - Категория атауын алу
          return $http.get('https://coursera-jhu-default-rtdb.firebaseio.com/categories.json')
            .then(function(categoryResponse) {
              var categories = categoryResponse.data;
              var category = null;
              
              for (var i = 0; i < categories.length; i++) {
                if (categories[i].short_name === categoryShortName) {
                  category = categories[i];
                  break;
                }
              }
              
              var categoryName = category ? category.name : categoryShortName;
              
              // 3. GET - Мәзір элементтерін алу
              var menuUrl = 'https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/' + categoryShortName + '.json';
              return $http.get(menuUrl)
                .then(function(menuResponse) {
                  var menuItems = [];
                  if (menuResponse.data && menuResponse.data.menu_items) {
                    menuItems = menuResponse.data.menu_items;
                  }
                  
                  // Мәзір элементтерін HTML-ға айналдыру
                  var menuItemsHtml = '';
                  for (var i = 0; i < menuItems.length; i++) {
                    var item = menuItems[i];
                    menuItemsHtml += '<div class="menu-item-tile col-md-6">';
                    menuItemsHtml += '<div class="row">';
                    menuItemsHtml += '<div class="col-sm-5">';
                    menuItemsHtml += '<div class="menu-item-photo">';
                    menuItemsHtml += '<div>' + (i+1) + '</div>';
                    menuItemsHtml += '<img class="img-responsive" width="250" height="150" src="images/menu/' + categoryShortName + '/' + categoryShortName + '.jpg" alt="Item">';
                    menuItemsHtml += '</div>';
                    menuItemsHtml += '<div class="menu-item-price">';
                    menuItemsHtml += (item.price_small || '') + ' <span>' + (item.small_portion_name || '') + '</span> ';
                    menuItemsHtml += (item.price_large || '') + ' <span>' + (item.large_portion_name || '') + '</span>';
                    menuItemsHtml += '</div></div>';
                    menuItemsHtml += '<div class="menu-item-description col-sm-7">';
                    menuItemsHtml += '<h3 class="menu-item-title">' + item.name + '</h3>';
                    menuItemsHtml += '<p class="menu-item-details">' + (item.description || '') + '</p>';
                    menuItemsHtml += '</div></div></div>';
                    menuItemsHtml += '<hr class="visible-xs">';
                  }
                  
                  var finalHtml = categoryHtml.replace('{{categoryName}}', categoryName);
                  finalHtml = finalHtml.replace('{{menuItemsHtml}}', menuItemsHtml);
                  
                  return finalHtml;
                });
            });
        })
        .then(function(finalHtml) {
          var compiled = $compile(finalHtml)($scope);
          mainView.append(compiled);
          loadingView.css('display', 'none');
        })
        .catch(function(error) {
          console.error('Error:', error);
          loadingView.css('display', 'none');
          mainView.html('<div class="error">Мәзірді жүктеу мүмкін болмады</div>');
        });
    };

    // Бастапқы жүктеу
    $ctrl.loadHome();
  }

})(window.angular);
