// BUDGET CONTROLLER
var budgetController = (function() {
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
      var sum = 0;
      data.allItems[type].forEach(function(cur){
          sum += cur.value;
      });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
        exp: 0,
        inc: 0
        },
        budget: 0,
        percentage: -1
        
    };
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            
            // Create new ID 
            if(data.allItems[type] > 0){
            ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }else{
                ID = 0;
            }
            // Create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
             
            // return the new elements
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;       
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index, 1)
            }
        },
        
        calculateBudget: function(){
      
        // calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');
        
        // calculate the budget income - expenses
        data.budget = data.totals.inc - data.totals.exp;
            
        // calculate the percentage of income that we spent 
            if(data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                } else {
                    data.percentage = -1;
                }
            
    },
        calculatePercentage: function(){
            data.allItems.exp.forEach(function(current){
               current.calcPercentage(data.totals.inc); 
            });
        },
        
        getPercentage: function(){
            var allPercentage = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();                                        
            });
        return allPercentage;
        },
        
        getBudget: function(){
          return{
              budget: data.budget,
              totalIncome: data.totals.inc,
              totalExpense: data.totals.exp,
              percentage: data.percentage
          }  
        }
        
    };
    
})();

// UI CONTROLLER
var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        };
    
     var formatNumber = function(num, type){
            var numSplit, int, dec;
            
            /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousandas
            */
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            if(int.length > 3) {
                int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, int.length); //inout 2310 result: 2,310
            }
            
            dec = numSplit[1];
            
            return  (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };
        
    var nodeListForEach = function(list, callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            };
    
    return {
     getinput: function(){
         return{
            type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
         };

     },
        addListItems: function(obj, type){
            var html, newHtml, element;
            // Create HTML string with placeholder
            if(type === 'inc'){
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type === 'exp')
                {
            element = DOMstrings.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorId){
            var el = document.getElementById(selectorId);  
            el.parentNode.removeChild(el);
        },
        
        clearFields: function(){
        var fields, fieldsArr;
            
        fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);  
            
        fieldsArr = Array.prototype.slice.call(fields);
            
        fieldsArr.forEach(function(current, index, array) {
            current.value = "";
        });
            
            fieldsArr[0].focus();
        },
        
         getDOMstrings: function(){
        return DOMstrings;
    },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpense, 'exp');
            
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        displayPercentage: function(percentages){
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index){
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        changedType: function(){
           var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur){
               cur.classList.toggle('red-focus'); 
            });
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },
        
        displayMonth: function(){
            var now, months, month, year;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        }
    
    };
    
   
})();

// GLOBAL APP CONTROLLER
 var controller = (function(budgetCtrl, UICtrl) {
     
     var setupEventListaners = function(){
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
     
        document.addEventListener('keypress', function(event){
        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
        }
     });
            
         document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
         
         document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
         
     };
     
     var updateBudget = function(){
         
         // Calculate the budget
         budgetCtrl.calculateBudget();
         
         // Return the budget
         var budget = budgetCtrl.getBudget();
         
         // Display the budged on UI
        UICtrl.displayBudget(budget);
     };
     
     var updatePercentage = function(){
         // 1. Calculate percentages
         budgetCtrl.calculatePercentage();
         
         // 2. Read percentages from the budget controller
         var percentage = budgetCtrl.getPercentage();
         
         // 3. Update the UI with the new percentage
         UIController.displayPercentage(percentage);
     }
     
     var ctrlAddItem = function(){
         var input, newItem;
         
         // get the field input data
         input = UICtrl.getinput();
         
         if(input.description !== "" && !isNaN(input.value) && input.value > 0){
             // add the item to the budget app
         newItem = budgetCtrl.addItem(input.type, input.description, input.value);
         
         // add the item to the UI
         UICtrl.addListItems(newItem, input.type);
         
         // Clear the fields
         UICtrl.clearFields();
         
         // Calculate and update budget
         updateBudget(); 
                          
         // update percentage
         updatePercentage();
         }
     };
     
     var ctrlDeleteItem = function(event){
       var itemID, splitID, type, ID;
         
         itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
         if(itemID){
             
             // inc-1
             splitID = itemID.split('-');
             type = splitID[0];
             ID = parseInt(splitID[1]);
             
             // delete the item from data structure
             budgetCtrl.deleteItem(type, ID);
             
             // delete the item from the user interface
             UICtrl.deleteListItem(itemID);
             
             // update and show new budget
             updateBudget(); 
             
             // update percentage
             updatePercentage();
         }
         
     };
     
     return{
         init: function(){
             console.log('Application has started.');
             UICtrl.displayMonth();
             UICtrl.displayBudget({
              budget: 0,
              totalIncome: 0,
              totalExpense: 0,
              percentage: -1
             });
             setupEventListaners();
         }
     }
 })(budgetController, UIController);

controller.init(); 



























































