const mysql = require('mysql');
const inquirer = require('inquirer');

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: 'localhost',

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: 'root',

  // Your password
  password: 'root',
  database: 'employee_DB',
});

// function which prompts the user for what action they should take
const start = () => {
  inquirer
    .prompt({
      name: 'menuChoice',
      type: 'list',
      message: 'What would you like to do?',
      choices: ['*View all employees', 'View all employees by department', 'View all employees by manager', '*Add employee', 'Remove employee', '*Update employee role', 'Update employee manager', '*View all roles', '*Add role', 'Delete role', '*View all departments', '*Add department', 'Delete department', 'View budget by department', 'Exit'],
    })
    .then((answer) => {
      // TODO: Starred options are required. Need to add all options on the menu
      if (answer.menuChoice === '*View all employees') {
        viewAllTable('employee');//done
      } else if (answer.menuChoice === '*Add employee') {
        addEmployee();
      } else if (answer.menuChoice === '*Update employee role') {
          updateEmployeeRole();
      } else if (answer.menuChoice === '*View all roles') {
          viewAllTable('role');//done
      } else if (answer.menuChoice === '*Add role') {
          addRole();
      } else if (answer.menuChoice === '*View all departments') {
          viewAllTable('department');//done
      } else if (answer.menuChoice === '*Add department') {
          addDepartment();
      } else {
        connection.end();
      }
    });
};

const viewAllTable = (category) => {
    const query = 'SELECT * from ??';
    let table = category
    connection.query(
        query,
        table,
        (err, results) => {
            if (err) throw err;
            console.log(results); 
        }
    )
    start();
};

const addEmployee = () => {
    connection.query('SELECT * from role', (err, results) => {
        if (err) throw err;
        connection.query('SELECT * from employee WHERE manager_id is null', (err, results2) => {
            if (err) throw err;

            inquirer
            .prompt(
            [
            {
              name: 'first_name',
              type: 'input',
              message: 'What is the employee\'s first name?'
            },
            {
              name: 'last_name',
              type: 'input',
              message: 'What is the employee\'s last name?'
            },
            {
                name: 'title',
                type: 'list',
                message: 'What is the employee\'s role?',
                choices() {
                    const choiceArray = [];
                    results.forEach(({ title }) => {
                      choiceArray.push(title);
                    });
                    return choiceArray;
                  }
            },
            {
                name: 'manager',
                type: 'list',
                message: 'Who is the employee\'s manager?',
                choices() {
                    const choiceArray = ['none'];
                    results2.forEach(({ first_name, last_name }) => {
                      choiceArray.push(`${first_name} ${last_name}`);
                    });
                    return choiceArray;
                  }
            }
        ])
            .then((answer) => {
              // TODO: crate employee object and send in update query
              var role_id;
              var manager_id;

              results.forEach((role) => {
                if (role.title === answer.title){
                    role_id = role.id;
                }
               })

               results2.forEach((person) => {
                if (`${person.first_name} ${person.last_name}` === answer.manager){
                    manager_id = person.id;
                }
               })
              let employee = {
                  first_name: answer.first_name,
                  last_name: answer.last_name,
                  role_id: role_id,
                  manager_id: manager_id
              }
              connection.query('INSERT INTO employee SET ?', employee, (err, res) => {
                  if (err) throw err;
                  console.log('Employee added');
                  start();
              })
              
                
                
            });
        })

    })
    

};
/*
// function to handle posting new items up for auction
const postAuction = () => {
  // prompt for info about the item being put up for auction
  inquirer
    .prompt([
      {
        name: 'item',
        type: 'input',
        message: 'What is the item you would like to submit?',
      },
      {
        name: 'category',
        type: 'input',
        message: 'What category would you like to place your auction in?',
      },
      {
        name: 'startingBid',
        type: 'input',
        message: 'What would you like your starting bid to be?',
        validate(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        },
      },
    ])
    .then((answer) => {
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        'INSERT INTO auctions SET ?',
        // QUESTION: What does the || 0 do?
        {
          item_name: answer.item,
          category: answer.category,
          starting_bid: answer.startingBid || 0,
          highest_bid: answer.startingBid || 0,
        },
        (err) => {
          if (err) throw err;
          console.log('Your auction was created successfully!');
          // re-prompt the user for if they want to bid or post
          start();
        }
      );
    });
};

const bidAuction = () => {
  // query the database for all items being auctioned
  connection.query('SELECT * FROM auctions', (err, results) => {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: 'choice',
          type: 'rawlist',
          choices() {
            const choiceArray = [];
            results.forEach(({ item_name }) => {
              choiceArray.push(item_name);
            });
            return choiceArray;
          },
          message: 'What auction would you like to place a bid in?',
        },
        {
          name: 'bid',
          type: 'input',
          message: 'How much would you like to bid?',
        },
      ])
      .then((answer) => {
        // get the information of the chosen item
        let chosenItem;
        results.forEach((item) => {
          if (item.item_name === answer.choice) {
            chosenItem = item;
          }
        });

        // determine if bid was high enough
        if (chosenItem.highest_bid < parseInt(answer.bid)) {
          // bid was high enough, so update db, let the user know, and start over
          connection.query(
            'UPDATE auctions SET ? WHERE ?',
            [
              {
                highest_bid: answer.bid,
              },
              {
                id: chosenItem.id,
              },
            ],
            (error) => {
              if (error) throw err;
              console.log('Bid placed successfully!');
              start();
            }
          );
        } else {
          // bid wasn't high enough, so apologize and start over
          console.log('Your bid was too low. Try again...');
          start();
        }
      });
  });
};
*/

// connect to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});
