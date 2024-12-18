/**********BUDGET CONTROLLER **********/
var budgetController = (function(){
    var Expense, Income, data;
    Expense = function(id, itemDes, itemValue){
        this.id = id;
        this.itemDes = itemDes;
        this.itemValue = itemValue;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.itemValue/totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    Income = function(id, itemDes, itemValue){
        this.id = id;
        this.itemDes = itemDes;
        this.itemValue = itemValue;
    };
var calculateTotals = function(type){
    var sum = 0;
    for(var i=0; i<data.allItems[type].length; i++){
        sum += parseFloat(data.allItems[type][i].itemValue);
    }
     data.totals[type] = sum;
}
    data = {
        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1
    };

    return{
        addItem: function(type, des, val){
            var newItem, ID;
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }
            else{
                ID = 0;
            }
            if(type ==='exp'){
                newItem = new Expense(ID, des, val);
            } else if( type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
                ids = data.allItems[type].map((current) =>{
                return current.id;
            });

            index = ids.indexOf(id);
            if(index !== -1){
             data.allItems[type].splice(index,1);
            }
             
        },
        testing:function(){
            console.log(data);
        },
        calcBudget: function(){

            //calculate total incomes and total expences 
            calculateTotals('inc');
            calculateTotals('exp');

             // calculate the budget: total incomes - total expenses
             data.budget = data.totals.inc - data.totals.exp;

             //calculate percentage
             data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
        },
       getBudget: function(){
        return{
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            budget: data.budget,
            percenTage: data.percentage
        }
        
       },
       calculatePercentages: function(){
            data.allItems.exp.forEach((cur) =>{
                cur.calcPercentage(data.totals.inc);
            })
       },
       getPercentages: function(){
        var allPerc = data.allItems.exp.map((cur) =>{
           return cur.getPercentage()
        })
        return allPerc;
       }
    }
    

})();


/**********UI CONTROLLER MODULE **********/
var UIController = (function(){
    var htmlElements = {
        month: '.month-year',
        input: '.add-input',
        type: '.type',
        des: '.add-des',
        value: '.add-val',
        addItem: '.add-item',
        incContainer: '.inc-inner',
        expContainer: '.exp-inner',
        showInc: '.showInc',
        showExp: '.showExp',
        showBudget: '.budget-left',
        showExpPercent: '.percentage',
        itemContainer: '.item-container',
        expensesPercLabel: '.item-percentage'
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec, sign; 
        /*
        + or - before numbers
        exactly 2 decimal places
        comma separating thousands
        */ 
       num = Math.abs(num);
       num = num.toFixed(2);
       numSplit = num.split('.')
       int = numSplit[0];

       if(int.length > 3){
        int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, 3)}`
       }

       dec = numSplit[1];
       type === 'exp' ? sign = '-' : sign = '+';

       return `${sign} ${int}.${dec}`;
    };

    return{
        allHtml: function(){
            return htmlElements;
        },
        addListItem: function(obj, type){
            var html, newHtml, element;
            //create a string with placeholder text
            if(type ==='inc'){
                element = htmlElements.incContainer;
            html = '<div class="inc-item" id="inc-%id%"><p>%description%</p><p>%value%</p><i class="fa fa-trash"></i></div>'
            }
            else if(type ==='exp'){
                element = htmlElements.expContainer;
                html = '<div class="exp-item" id="exp-%id%"><p>%description%</p><p>%value%</p><p class="item-percentage">20%</p><i class="fa fa-trash"></i></div>'
            }
            //replace placeholder text with some actual date
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.itemDes);
            newHtml = newHtml.replace('%value%', formatNumber(obj.itemValue, type));
            // newHtml = newHtml.replace('%20%', obj.percentage);

            //insert the HTMl into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        removeItem: function(item){
            var el;
            el = document.getElementById(item);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fieldsArr;
            fieldsArr = document.querySelectorAll('input');
            fieldsArr.forEach(field =>{
                field.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj, type){
            var element, total;
            if(type ==='inc'){
                element = htmlElements.showInc;
                total = obj.totalInc;
            }
            else if(type ==='exp'){
                element = htmlElements.showExp;
                total = obj.totalExp;
            };

            document.querySelector(element).textContent = formatNumber(total, type);
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            document.querySelector(htmlElements.showBudget).textContent = formatNumber(obj.budget, type);
           
            if(!isFinite(obj.percenTage)){
                document.querySelector(htmlElements.showExpPercent).textContent = "---";  
            }
            else{
            document.querySelector(htmlElements.showExpPercent).textContent = `${obj.percenTage}%`;

            };
        },
        displayPercentages: function(percentages){
            var fields, nodeListForEach;
            fields = document.querySelectorAll(htmlElements.expensesPercLabel);
            
            nodeListForEach = function(list, callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            }

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                current.textContent = `${percentages[index]}%`;
                }
                else{
                current.textContent = `---`;

                }
            })
        }
     
    };
    
   
   })();


/*******GLOBAL APP CONTROLLER ******/
(function(UICtrl, budgetCtrl){
    var DOM, type, des, val; 
    //RETURNING HTML ELEMENTS FROM THE UI CONTROLLER
    DOM = UICtrl.allHtml();
    
    type = document.querySelector(DOM.type);
    function toggleInput(){
        type.classList.toggle('red');
        document.querySelector(DOM.des).classList.toggle('red');
        document.querySelector(DOM.value).classList.toggle('red');
    }
    
    type.addEventListener('change', toggleInput);

    function init(){
    var date, months, month, year, DOM1;
    date = new Date();
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
    
    month = date.getMonth();
    month = months[month];

    year = date.getFullYear();

    //calling the DOMString method from the UIController
    monthString = document.querySelector(DOM.month).textContent = `${month} ${year}`;

    var updatePercentages = function(){
        // 1.calculate percentages
            budgetCtrl.calculatePercentages();

        // 2.Read percentages from the budget controller
          var percentages =  budgetCtrl.getPercentages();

        // 3.Update the UI with the new percentages
            UICtrl.displayPercentages(percentages);
            // console.log(percentages);
    }
    var ctrlAddItems = function(){
        var newItm, incExpObject;
        // 1. get input fields data
            des = document.querySelector(DOM.des).value;
            val = document.querySelector(DOM.value).value;

            if(des.value !== "" && !isNaN(val) && val > 0){
            // 2. add item to the budget controller
                newItm = budgetCtrl.addItem(type.value, des, val);
            // 3. update the User Interface
                UICtrl.addListItem(newItm, type.value);
    
            // 4. Clear input fields
                UICtrl.clearFields();
            // 5. calculate and update budget
                budgetCtrl.calcBudget();
                incExpObject = budgetCtrl.getBudget();
            // 6. display budget on the UI
                UICtrl.displayBudget(incExpObject, type.value);

                updatePercentages();
            }
            else{
                alert('Input fields can\'t be empty');
                document.querySelector(DOM.des).focus();
            }
       
    }
    
    function ctrlDeleteItem(ev){
        let itemID, splitID, type, ID;
        if(ev.target.className === 'fa fa-trash'){
            itemID = ev.target.parentNode.id;
        if (itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // 1. delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. delete item from from UI
            UICtrl.removeItem(itemID);
            // 3. update the budget
            budgetCtrl.calcBudget();
            incExpObject = budgetCtrl.getBudget();
            UICtrl.displayBudget(incExpObject, type);
            updatePercentages();
        }
        }
        
    };

    
    document.querySelector(DOM.addItem).addEventListener('click', ctrlAddItems);
    document.querySelector(DOM.itemContainer).addEventListener('click', ctrlDeleteItem);

    document.addEventListener('keypress', function(ev){
        if(ev.keyCode === 13 || ev.which === 13){
            ctrlAddItems();
        }
    });

    };


    init();
 

})(UIController, budgetController);



      

