Now i want to develop a system for firm/company that deals with ATM Installation,maintenance,support and fixing. But this system should be able to accomodate any type of business and not only ATM. 

Backend - Nodejs
Frontend - ReactJs
MySql database
sequelize for database interactions
backed/uploads - file storage
smtp for email
TOOLS
Multer,jwt,websocket,

There should be roles [admin,engineer,finance,manager,reception,hr,project-manager,stock]
Where roles [stock,admin,engineer] can manipulate stock movement
There should be a dashboard page displaying statistics of stocks
Stock listing page should display all stock products with their [(images&short-videos),name,description,price,condition(new,used,damaged,),product-model&version,product-serial-code/number,quantity,Receipt or other attachments and other details] 
Then add all other required pages for Data management and stock utilizations
Use popup modals for data entry,editing,confirmations and confirmations before deleting

Some required data&tables are[users,roles,products,product-makers/brand,categories,suppliers,stock_in,stock_out,system_logs,settings(system-name,logo,default-color,smtp_hostname,smtp_email,smtp_port,),e.t.c]

System should have features like[light/dark-mode,notifications,localization(multi-languages),theme-color-customization,pagination,Live-update-stock-movement(real-time)]

System should have all the necessary security,functionality,integrity and reliability features

The database is already running and it is accessed by other systems through sequelize with these .env variables:
[
    NODE_ENV=development
    PORT=3000
    DB_HOST=127.0.0.1
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=test
    DB_PORT=3306
    DB_DIALECT=mysql
    JWT_SECRET=your_jwt_secret_key_here
    JWT_EXPIRE=7d

    CONTACTFORM_SMTP_HOSTNAME=smtp.gmail.com
    CONTACTFORM_SMTP_PORT=465
    CONTACTFORM_SMTP_USERNAME=dereklyatuu@gmail.com
    CONTACTFORM_SMTP_PASSWORD=wcrx wpkp yemm wthv
]


>The system should be user friendly, responsive, adaptive across all screen sizes and devices

