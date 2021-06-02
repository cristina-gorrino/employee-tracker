const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

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
      choices: ['*View all employees', 'View all employees by department', 'View all employees by manager', '*Add employee', 'Remove employee', '*Update employee role', 'Update employee manager', '*View all roles', '*Add role', 'Remove role', '*View all departments', '*Add department', 'Remove department', 'View budget by department', 'Exit'],
    })
    .then((answer) => {
      // TODO: Starred options are required. Need to add all options on the menu
      if (answer.menuChoice === '*View all employees') {
        viewAllTable('employee');
      } else if (answer.menuChoice === '*Add employee') {
        addEmployee();
      } else if (answer.menuChoice === '*Update employee role') {
          updateEmployeeRole(); 
      } else if (answer.menuChoice === '*View all roles') {
          viewAllTable('role');
      } else if (answer.menuChoice === '*Add role') {
          addRole();
      } else if (answer.menuChoice === '*View all departments') {
          viewAllTable('department');
      } else if (answer.menuChoice === '*Add department') {
          addDepartment();
      } else if (answer.menuChoice === 'Remove employee') {
          deleteRecord('employee');
      } else if (answer.menuChoice === 'Remove role') {
          deleteRecord('role');
      } else if (answer.menuChoice === 'Remove department') {
          deleteRecord('department');
      } else if (answer.menuChoice === 'View all employees by department') {
          viewEmployeesBy('department');
      } else if (answer.menuChoice === 'View all employees by manager') {
          viewEmployeesBy('manager');
      } else if (answer.menuChoice === 'Update employee manager'){
          updateEmployeeManager();
      } else if (answer.menuChoice === 'View budget by department') {
          calculateBudget();
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
            console.log('-----------------------------------'); 
            console.table(results);
            console.log('-----------------------------------');
            start();
        }
    )
    
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

const updateEmployeeRole = () => {
    connection.query('SELECT * from employee', (err, employeeResults) => {
        if (err) throw err;
        connection.query('SELECT * from role', (err, roleResults) => {
            if (err) throw err;
            inquirer
            .prompt([
                {
                    name: 'employeeToUpdate',
                    type: 'list',
                    message: 'Which employee\'s role do you want to update?',
                    choices() {
                        const choiceArray = [];
                        employeeResults.forEach(({ first_name, last_name }) => {
                          choiceArray.push(`${first_name} ${last_name}`);
                        });
                        return choiceArray;
                      }
                },
                {
                    name: 'newRole',
                    type: 'list',
                    message: 'Which new role should this employee have?',
                    choices() {
                        const choiceArray = [];
                        roleResults.forEach(({title}) => {
                          choiceArray.push(title);
                        });
                        return choiceArray;
                      }
                }
            ])
            .then((answer) => {
                var employee_id;
                var role_id;

                roleResults.forEach((role) => {
                    if (role.title === answer.newRole){
                        role_id = role.id;
                    }
                })
    
                employeeResults.forEach((person) => {
                    if (`${person.first_name} ${person.last_name}` === answer.employeeToUpdate){
                        employee_id = person.id;
                    }
                })
                connection.query('UPDATE employee SET ? WHERE ?',
                [{role_id: role_id}, {id: employee_id}],
                (err, res) => {
                    if (err) throw err;
                    console.log('Successfully updated employee role');
                    start();
                })
            })
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
            results.forEach((dept) => {
                if (dept.name === answer.department){
                    department_id = dept.id;
                }
        })
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

const deleteRecord = (category) => {
    let table = category;
    connection.query('SELECT * from ??', table, (err, results) => {
        if (err) throw error;
        inquirer
        .prompt([
            {
                name: 'recordToDelete',
                type: 'list',
                message: `Which ${table} would you like to remove?`,
                choices() {
                    const choiceArray = [];
                    if (table === 'employee'){
                        results.forEach(({ first_name, last_name }) => {
                            choiceArray.push(`${first_name} ${last_name}`);
                          });
                          return choiceArray;
                    } else if (table === 'role') {
                        results.forEach(({title}) => {
                            choiceArray.push(title);
                        });
                        return choiceArray;
                    } else if (table === 'department') {
                        results.forEach(({name}) => {
                            choiceArray.push(name);
                        });
                        return choiceArray;
                    }
                }
            }
        ])
        .then((answer) => {
            var recordReference;

            if (table === 'role'){
                results.forEach((role) => {
                    if (role.title === answer.recordToDelete){
                        recordReference = role.id;
                    }
                })
            } else if (table === 'employee') {
                results.forEach((person) => {
                    if (`${person.first_name} ${person.last_name}` === answer.recordToDelete){
                        recordReference = person.id;
                    }
                })
            } else if (table === 'department') {
                results.forEach((dpt) => {
                    if (dpt.name === answer.recordToDelete) {
                        recordReference = dpt.id;
                    }
                })
            }
            connection.query('DELETE from ?? WHERE ?',
            [table, {id: recordReference}],
            (err, res) => {
                if (err) throw err;
                console.log('Record successfully removed');
                start();
            })
        })
    })

};

const viewEmployeesBy = (category) => {
    if (category === 'manager'){
        var query = 'SELECT * from employee WHERE manager_id is null'; 
    } if (category === 'department') {
        var query = 'SELECT * from department';
    }

    connection.query(query, (err, results) => {
        if (err) throw err;
        inquirer
        .prompt([
            {
                name: 'viewBy',
                type: 'list',
                message: `For which ${category} would you like to see employees?`,
                choices() {
                    const choiceArray = [];
                    if (category === 'manager'){
                        results.forEach(({ first_name, last_name }) => {
                            choiceArray.push(`${first_name} ${last_name}`);
                          });
                          return choiceArray;
                    } else if (category === 'department') {
                        results.forEach(({name}) => {
                            choiceArray.push(name);
                        });
                        return choiceArray;
                    }
                }
            }
        ])
        .then((answer) => {
            var criteria;

            if (category === 'manager') {
                results.forEach((person) => {
                    if (`${person.first_name} ${person.last_name}` === answer.viewBy){
                        criteria = {manager_id: person.id};
                    }
                })
            } else if (category === 'department') {
                results.forEach((dpt) => {
                    if (dpt.name === answer.viewBy) {
                        criteria = {id: dpt.id};
                    }
                })
            }
            const query = 'SELECT * from employee WHERE ?';
            connection.query(
                query,
                criteria,
                (err, results) => {
                    if (err) throw err;
                    console.log('-----------------------------------'); 
                    console.table(results);
                    console.log('-----------------------------------');
                    start();
                }
            )
        })
    })
    
    
};

const updateEmployeeManager = () => {
    connection.query('SELECT * from employee', (err, employeeResults) => {
        if (err) throw err;
        connection.query('SELECT * from employee WHERE manager_id is null', (err, managerResults) => {
            if (err) throw err;
            inquirer
            .prompt([
                {
                    name: 'employeeToUpdate',
                    type: 'list',
                    message: 'Which employee\'s manager do you want to update?',
                    choices() {
                        const choiceArray = [];
                        employeeResults.forEach(({ first_name, last_name }) => {
                          choiceArray.push(`${first_name} ${last_name}`);
                        });
                        return choiceArray;
                      }
                },
                {
                    name: 'newManager',
                    type: 'list',
                    message: 'Which manager should this employee have?',
                    choices() {
                        const choiceArray = ['none'];
                        managerResults.forEach(({first_name, last_name}) => {
                          choiceArray.push(`${first_name} ${last_name}`);
                        });
                        return choiceArray;
                      }
                }
            ])
            .then((answer) => {
                var employee_id;
                var manager_id;

                managerResults.forEach((manager) => {
                    if (`${manager.first_name} ${manager.last_name}` === answer.newManager){
                        manager_id = manager.id;
                    }
                })
    
                employeeResults.forEach((person) => {
                    if (`${person.first_name} ${person.last_name}` === answer.employeeToUpdate){
                        employee_id = person.id;
                    }
                })
                connection.query('UPDATE employee SET ? WHERE ?',
                [{manager_id: manager_id}, {id: employee_id}],
                (err, res) => {
                    if (err) throw err;
                    console.log('Successfully updated employee manager');
                    start();
                })
            })
        })
    })
};

const calculateBudget = () => {
    connection.query('SELECT * from department', (err, results) => {
        if (err) throw err;
        inquirer
        .prompt([
            {
                name: 'department',
                type: 'list',
                message: 'For which department would you like to calculate the total utilized budget?',
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
            results.forEach((dept) => {
                if (dept.name === answer.department){
                    department_id = dept.id;
                }
            })
            connection.query('SELECT sum(salary) as tot_department_budget from role WHERE ?',
            {department_id: department_id},
            (err, res) => {
                if (err) throw err;
                console.log('-----------------------------------'); 
                console.table(res);
                console.log('-----------------------------------');
                start();
            } )
        })
    })
};


// connect to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});
