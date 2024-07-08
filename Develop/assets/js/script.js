
const taskForm = $("#task-form");
const taskName = $("#task-name");
const taskDescription = $("#task-description");
const taskDueDate = $("#task-due-date");
const mainBtn = $("#main");
const addBtn = $("#add-btn");
const modal = $("#exampleModal");

function readProjectsFromStorage() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  return tasks;
}

function saveProjectsToStorage(tasks) {
  
  const tasksString = JSON.stringify(tasks);

  localStorage.setItem("tasks", tasksString);
}

function createTaskCard(task) {
  const card = $("<div>").addClass("card project-card draggable my-3").attr("data-project-id", task.id);
  const cardHeader = $("<h4>").addClass("card-header").text(task.name);
  const cardBody = $("<div>").addClass("card-body");
  const cardType = $("<p>").addClass("card-text").text(task.type);
  const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const cardDeleteBtn = $("<button>").addClass("btn btn-danger delete").text("Delete").attr("data-project-id", task.id);

  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

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

function renderTaskList() {
  const tasks = readProjectsFromStorage();
  const todoList = $("#todo-cards");
  todoList.empty();
  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();
  const doneList = $("#done-cards");
  doneList.empty();

  if (tasks) {
    for (let task of tasks) {
      const taskCard = createTaskCard(task);

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
    
    helper: function (e) {
      
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
    
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

$(document).on('click', '.delete', function() {
    const taskId = $(this).data('project-id'); 
    
    const tasks = readProjectsFromStorage();

    for (let i = 0; i < tasks.length; i++) {
              if (tasks[i].id === taskId) {
                tasks.splice(i, 1);
                break;
              }
            }
          
    saveProjectsToStorage(tasks);
  
    renderTaskList();
});

function handleAddTask(event) {
  event.preventDefault();

  const task = taskName.val();
  const taskType = taskDescription.val();
  const taskDue = taskDueDate.val();

  const newTask = {
    id: crypto.randomUUID(),
    name: task,
    type: taskType,
    dueDate: taskDue,
    status: "to-do",
  };

  const tasks = readProjectsFromStorage();
  tasks.push(newTask);

  saveProjectsToStorage(tasks);

  renderTaskList();

    taskName.val("");
    taskDescription.val("");
    taskDueDate.val("");
}

function handleDrop(event, ui) {

  const tasks = readProjectsFromStorage();
  const taskId = ui.draggable.data('project-id');

  const newStatus = event.target.id;

  for (let task of tasks) {
    
    if (task.id === taskId) {
      task.status = newStatus;
      break;
    }
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTaskList();
}

taskForm.on("submit", handleAddTask);

$(document).ready(function () {

  renderTaskList();

  $("#task-due-date").datepicker({
    changeMonth: true,
    changeYear: true,
  });

  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});
