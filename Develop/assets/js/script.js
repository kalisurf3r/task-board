// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

function readProjectsFromStorage() {
  // TODO: Retrieve projects from localStorage and parse the JSON to an array. If there are no projects in localStorage, initialize an empty array and return it.
  const projects = JSON.parse(localStorage.getItem("projects")) || [];
  return projects;
}

// TODO: Create a function that accepts an array of projects, stringifys them, and saves them in localStorage.
function saveProjectsToStorage(projects) {
  // Convert the projects array to a string using JSON.stringify
  const projectsString = JSON.stringify(projects);

  // Save the stringified projects array to localStorage under a key, e.g., 'projects'
  localStorage.setItem("projects", projectsString);
}

// Todo: create a function to generate a unique task id
function generateTaskId() {
  const id = nextId;
  nextId++;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const card = $("<div>")
    .addClass("card project-card draggable my-3")
    .attr("data-project-id", task.id);
  const cardHeader = $("<h4>").addClass("card-header").text(task.name);
  const cardBody = $("<div>").addClass("card-body");
  const cardType = $("<p>").addClass("card-text").text(task.type);
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("data-project-id", task.id);

  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

    // ? If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, "day")) {
      card.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      card.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  cardBody.append(cardType, cardDueDate, cardDeleteBtn);

  card.append(cardHeader, cardBody);

  return card;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const projects = readProjectsFromStorage();
  const list = [];
  const todoList = $("#todo");
  todoList.empty();
  const inProgressList = $("#in-progress");
  inProgressList.empty();
  const doneList = $("#done");
  doneList.empty();

  if (projects) {
    for (let task of projects) {
      const taskCard = createTaskCard(task);

      // ? Append the card to the correct lane based on the status of the project
      if (task.status === "to-do") {
        todoList.append(taskCard);
      } else if (task.status === "in-progress") {
        inProgressList.append(taskCard);
      } else if (task.status === "done") {
        doneList.append(taskCard);
      }
    }
  }

  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,
    // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
    helper: function (e) {
      // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
      // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  // const taskItem = $('#formModal').val();

  // ? Create a new project object with the data from the form
  const newTask = {
    // ? Here we use a tool called `crypto` to generate a random id for our project. This is a unique identifier that we can use to find the project in the array. `crypto` is a built-in module that we can use in the browser and Nodejs.
    id: crypto.randomUUID(),
    // name: projectName,
    // type: projectType,
    // dueDate: projectDate,
    status: "to-do",
  };

  // ? Pull the projects from localStorage and push the new project to the array
  const projects = readProjectsFromStorage();
  projects.push(newTask);

  // ? Save the updated projects array to localStorage
  saveProjectsToStorage(projects);

  // ? Print project data back to the screen
  renderTaskList();

  //   taskItem.val("");
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = generateTaskId();
  const tasks = readProjectsFromStorage();

  // TODO: Loop through the projects array and remove the project with the matching id.
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) {
      tasks.splice(i, 1);
      // break;
    }
  }
  // ? We will use our helper function to save the projects to localStorage
  saveProjectsToStorage(tasks);

  // ? Here we use our other function to print projects back to the screen
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  // ? Read projects from localStorage
  const projects = readProjectsFromStorage();

  // ? Get the project id from the event
  const taskId = ui.draggable[0].dataset.projectId;

  // ? Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for (let project of projects) {
    // ? Find the project card by the `id` and update the project status.
    if (project.id === taskId) {
      project.status = newStatus;
    }
  }

  // ? Save the updated projects array to localStorage (overwritting the previous one) and render the new project data to the screen.
  localStorage.setItem("projects", JSON.stringify(projects));
  renderTaskList();
}

$(document).on("click", ".delete", handleDeleteTask);
$(document).on("click", handleAddTask);
// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  // ? Print project data to the screen on page load if there is any
  renderTaskList();

  $("#taskDueDate").datepicker({
    changeMonth: true,
    changeYear: true,
  });

  // ? Make lanes droppable
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});
