import os
import yaml
import mysql.connector as database
import matplotlib.pyplot as plt
import shutil

history_init_filename = "viewhistory.init.yaml"
history_filename = "viewhistory.yaml"
history_diagram_filename = "history_diagram.png"

connection = database.connect(
    user=os.environ.get('DB_USER'),
    password=os.environ.get('DB_PASSWORD'),
    host=os.environ.get('DB_HOST'),
    database=os.environ.get('DB_DATABASE'))
cursor = connection.cursor()

def update_history_yaml():
    print('getting current viewcount from db')
    statement = "SELECT view_count FROM posts WHERE title=\"My first Post\""
    cursor.execute(statement)
    for (view_count, ) in cursor:
        with open(history_filename, "a") as myfile:
            myfile.write(f"  - {view_count}\n")
    print('wrote current viewcount to file')

def  plot_history_yaml():
    try:
        print('reading history file')
        with open(history_filename) as view_history_file:
            view_history = yaml.unsafe_load(view_history_file)
    except Exception as e:
        print(e)
        shutil.copyfile(history_init_filename, history_filename)
        print('restoring history file due to yaml errors')
        return plot_history_yaml()

    # plotting the points
    plt.plot(range(len(view_history["history"])), view_history["history"])

    # naming the x axis
    plt.xlabel('x - time')
    # naming the y axis
    plt.ylabel('y - view_count')

    # giving a title to my graph
    plt.title(view_history["title"])

    plt.savefig(history_diagram_filename)
    print('saved updated plot to '+history_diagram_filename)

update_history_yaml()
plot_history_yaml()

cursor.close()
connection.close()
