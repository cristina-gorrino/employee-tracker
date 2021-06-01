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
        addEmployee();//done
      } else if (answer.menuChoice === '*Update employee role') {
          updateEmployeeRole();
      } else if (answer.menuChoice === '*View all roles') {
          viewAllTable('role');//done
      } else if (answer.menuChoice === '*Add role') {
          addRole();//done
      } else if (answer.menuChoice === '*View all departments') {
          viewAllTable('department');//done
      } else if (answer.menuChoice === '*Add department') {
          addDepartment();//done
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
              // Create employee object and send in update query
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

const addRole = () => {
    connection.query('SELECT * from department', (err, results) => {
        if (err) throw err;
        inquirer
        .prompt([
            {
                name:'title',
                type: 'input',
                message: 'What is the title of this role?'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary for this role?'
            },
            {
                name: 'department',
                type:  'list',
                message: 'Choose the department this role belongs to',
                choices() {
                    const choiceArray = [];
                    results.forEach(({name}) => {
                        choiceArray.push(name);
                    });
                    return choiceArray;
                }

            }
        ])
        .then((answer) => {
            var department_id;
            results.forEach((department) => {
                if (department.name === answer.department){
                    department_id = department.id;
                }

            const role = {
                title: answer.title,
                salary: answer.salary,
                department_id: department_id
            }
            connection.query('INSERT INTO role SET ?', role, (err, res) => {
                if (err) throw err;
                console.log('Role added');
                start();
            })
        })
    })
})
};

const addDepartment = () => {
    inquirer
    .prompt({
        name: 'departmentName',
        type: 'input',
        message: 'What is the name of the department?'

    })
    .then((answer) => {
        connection.query('INSERT INTO department SET ?', 
        {name: answer.departmentName}, (err, res) => {
            if (err) throw err;
            console.log('Department added');
            start();
        })
    })
};


// connect to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});
