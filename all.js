const apiUrl = "https://todoo.5xcamp.us";

const divMain = document.querySelector(".main");
const divLogin = document.querySelector(".login");
const divRegister = document.querySelector(".register");
const divTodo = document.querySelector(".todo");
const divCart_empty = document.querySelector(".cart_empty");
const divCard_list = document.querySelector(".card_list");

let userEmail = "";
let userNickname = "";
let todoData = [];
let toggleStatus = 'all';

const userName = document.getElementById("userName");
const inputText = document.getElementById("inputText");
const workNum = document.getElementById("workNum");
const btnDel = document.getElementById("btnDel");

function init() {
    userEmail = "";
    userNickname = "";
    todoData = [];
    toggleStatus = 'all';
    divMain.removeAttribute("style");
    divTodo.setAttribute("style", "display: none;");
    divRegister.setAttribute("style", "display: none;");
}
init();

//跳轉註冊
const linkReg = document.getElementById("linkReg");
linkReg.addEventListener("click", e => {
    e.preventDefault();
    divLogin.setAttribute("style", "display: none;");
    divRegister.removeAttribute("style");
})
//註冊
const btnReg = document.getElementById("btnReg");
const regEmail = document.getElementById("regEmail");
const regNickname = document.getElementById("regNickname");
const regPwd = document.getElementById("regPwd");
const regPwdAgain = document.getElementById("regPwdAgain");
btnReg.addEventListener("click", e => {
    let email = regEmail.value.trim();
    let nickname = regNickname.value.trim();
    let pwd = regPwd.value.trim();
    let pwd2 = regPwdAgain.value.trim();
    if (email == "" || nickname == "" || pwd == "" || pwd2 == "") {
        alert("欄位不可空白");
        return;
    } else if (pwd != pwd2) {
        alert("兩次密碼不相符，請再次輸入密碼");
        return;
    }

    signUp(email, nickname, pwd)
        .then(data => {
            userEmail = data.email;
            userNickname = data.nickname;
            userName.textContent = userNickname;
            alert(data.message);
            divMain.setAttribute("style", "display: none;");
            divTodo.removeAttribute("style");
            divCard_list.setAttribute("style", "display: none;");
        })
        .catch(err => {
            alert(err.message + err.error[0]);
        });
})
//跳轉登入
const linkLogin = document.getElementById("linkLogin");
linkLogin.addEventListener("click", e => {
    e.preventDefault();
    divLogin.removeAttribute("style");
    divRegister.setAttribute("style", "display: none;");
})
//登入>取得代辦
const btnLogin = document.getElementById("btnLogin");
const loginEmail = document.getElementById("loginEmail");
const loginPwd = document.getElementById("loginPwd");
btnLogin.addEventListener("click", e => {
    let email = loginEmail.value.trim();
    let pwd = loginPwd.value.trim();
    if (email == "" || pwd == "") {
        alert("欄位不可空白");
        return;
    }

    login(email, pwd)
        .then(data => {
            userEmail = data.email;
            userNickname = data.nickname;
            userName.textContent = userNickname;
            // alert(data.message);

            getTodo()
                .then(data => {
                    divMain.setAttribute("style", "display: none;");
                    divTodo.removeAttribute("style");
                    //取得代辦
                    todoData = data.todos;
                    updTodoList();
                })
                .catch(err => {
                    alert(err.message);
                });
        })
        .catch(err => {
            alert(err.message);
        });
})
//登出>回到登入頁
const linkLogout = document.getElementById("linkLogout");
linkLogout.addEventListener("click", e => {
    e.preventDefault();
    logout()
        .then(data => init())
        .catch(err => {
            alert(err.message);
        });
})
//新增代辦
const btnAdd = document.getElementById("btnAdd");
btnAdd.addEventListener("click", e => {
    e.preventDefault();
    addTodoList();
})
//優化 - 新增用Enter送出
inputText.addEventListener('keypress', function (e) {
    if (e.key == 'Enter') {
        addTodoList();
    }
});
//tab切換
const tab = document.getElementById("tab");
tab.addEventListener("click", e => {
    toggleStatus = e.target.dataset.tab;
    let tabs = document.querySelectorAll('#tab li');
    tabs.forEach(item => item.classList.remove('active'));
    e.target.classList.add('active');
    updTodoList();
})
// List 打勾 / 刪除
const todoList = document.getElementById("todoList");
todoList.addEventListener("click", e => {
    let id = e.target.closest('li').dataset.id;
    if (e.target.classList.value == 'delete') {
        e.preventDefault();
        delTodo(id)
            .then(data => {
                todoData = todoData.filter(item => item.id != id);
                updTodoList();
            })
            .catch(err => {
                alert(err.message);
            });
    } else {
        // 切換 代辦 狀態
        toggleTodo(id)
            .then(data => {
                todoData.forEach((item, index) => {
                    if (item.id == id) {
                        todoData[index].completed_at = data.completed_at;
                    }
                });
                updTodoList();
            })
            .catch(err => {
                alert(err.message);
            });
    }
})
//清除已完成todo
btnDel.addEventListener('click', function (e) {
    e.preventDefault();
    let clearAry = [];
    todoData.forEach(item => {
        if (item.completed_at != null) {
            let a = delTodo(item.id);
            clearAry.push(a);
        }
    })
    if (clearAry.length > 0) {
        Promise.all(clearAry)
            .then(data => {
                todoData = todoData.filter(item => item.completed_at == null);
                updTodoList();
            })
            .catch(err => {
                alert(err.message);
            });
    }
});
//===FUNCTION=================
//新增代辦
function addTodoList() {
    let addstr = inputText.value.trim();
    if (addstr == "") {
        return;
    }
    addTodo(addstr)
        .then(data => {
            let newData = {
                "id": data.id,
                "content": data.content,
                "completed_at": null
            }
            todoData.unshift(newData);
            updTodoList();
            inputText.value = "";
        })
        .catch(err => {
            alert(err.message);
        });
}
//依tab更新代辦清單
function updTodoList() {
    if (todoData.length > 0) {
        divCart_empty.setAttribute("style", "display: none;");
        divCard_list.removeAttribute("style");

        let showData = [];
        if (toggleStatus == 'all') {
            showData = todoData;
        } else if (toggleStatus == 'work') {
            showData = todoData.filter(item => item.completed_at == null);
        } else {
            showData = todoData.filter(item => item.completed_at != null);
        }

        workNum.textContent = todoData.filter(item => item.completed_at == null).length;

        getTodoList(showData);
    } else {
        divCart_empty.removeAttribute("style");
        divCard_list.setAttribute("style", "display: none;");
    }
}
//取得代辦>渲染畫面清單
function getTodoList(data) {
    let str = "";
    data.forEach(item => {
        let chk = item.completed_at == null ? "" : "checked"
        str += `<li data-id="${item.id}">
                    <label class="checkbox" for="">
                    <input type="checkbox" ${chk}/>
                    <span>${item.content}</span>
                    </label>
                    <a href="#" class="delete"></a>
                    </li>`
    });
    todoList.innerHTML = str;
}
//===API=================
//註冊
function signUp(email, nickname, password) {
    return new Promise((resolve, reject) => {
        axios.post(`${apiUrl}/users`, {
            "user": {
                "email": email,
                "nickname": nickname,
                "password": password
            }
        })
            .then(res => {
                axios.defaults.headers.common['Authorization'] = res.headers.authorization;
                resolve(res.data);
            })
            .catch(err => reject(err.response.data));
    })
}
//登入
function login(email, password) {
    return new Promise((resolve, reject) => {
        axios.post(`${apiUrl}/users/sign_in`, {
            "user": {
                "email": email,
                "password": password
            }
        })
            .then(res => {
                axios.defaults.headers.common['Authorization'] = res.headers.authorization;
                resolve(res.data);
            })
            .catch(err => reject(err.response.data));
    })
}
//登出
function logout() {
    return new Promise((resolve, reject) => {
        axios.delete(`${apiUrl}/users/sign_out`)
            .then(res => resolve(res.data))
            .catch(err => reject(err.response.data));
    })
}
//取得代辦
function getTodo() {
    return new Promise((resolve, reject) => {
        axios.get(`${apiUrl}/todos`)
            .then(res => resolve(res.data))
            .catch(err => reject(err.response.data));
    })
}
//新增代辦
function addTodo(content) {
    return new Promise((resolve, reject) => {
        axios.post(`${apiUrl}/todos`, {
            "todo": {
                "content": content
            }
        })
            .then(res => resolve(res.data))
            .catch(err => reject(err.response.data));
    })
}
//修改代辦
function updTodo(content, id) {
    axios.put(`${apiUrl}/todos/${id}`, {
        "todo": {
            "content": content
        }
    })
        .then(res => console.log(res))
        .catch(err => console.log(err.response));
}
//刪除代辦
function delTodo(id) {
    return new Promise((resolve, reject) => {
        axios.delete(`${apiUrl}/todos/${id}`)
            .then(res => resolve(res.data))
            .catch(err => reject(err.response.data));
    })
}
//更新代辦狀態
function toggleTodo(id) {
    return new Promise((resolve, reject) => {
        axios.patch(`${apiUrl}/todos/${id}/toggle`)
            .then(res => resolve(res.data))
            .catch(err => reject(err.response.data));
    })
}