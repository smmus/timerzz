// -------------------------------materialize------------------------------
let floatingActionButtons = document.querySelectorAll('.fixed-action-btn');
let floatingActionButtonsInstances = M.FloatingActionButton.init(floatingActionButtons);

let sideNavs = document.querySelectorAll('.sidenav');
let sideNavsInstances = M.Sidenav.init(sideNavs);

var instances = M.Modal.init(document.querySelectorAll('.modal'));

M.Datepicker.init(document.querySelectorAll('.datepicker'));
M.Timepicker.init(document.querySelectorAll('.timepicker'), { defaultTime: "now" });

///////////////////--------------------progess bar
document.querySelectorAll(".progress").forEach(e => {

    let value = e.attributes['data-value'].value
    var left = e.querySelector('.progress-left .progress-bar');
    var right = e.querySelector('.progress-right .progress-bar');

    if (value > 0) {
        if (value <= 50) {
            right.css('transform', 'rotate(' + percentageToDegrees(value) + 'deg)')
        } else {
            right.style.transform = "rotate(180deg)"
            left.style.transform = 'rotate(' + percentageToDegrees(value - 50) + 'deg)'
        }
    }

})

function percentageToDegrees(percentage) {

    return percentage / 100 * 360

}

//--------------------------add new timer-----------------------------------------------
function addNewTimer(e) {
    let modal = e.parentNode.parentNode;

    console.log(modal)

    let name = modal.querySelector(".timer_name").value
    let date = modal.querySelector(".datepicker").value
    let time = modal.querySelector(".timepicker").value

    console.log(name, date, time)

    if (name == '' && time == "" && date == "") {
        alert("Insert Name, Date, Time properly!");
        return;
    }

    let newDate = new Date(date + " " + time);

    console.log(newDate)

    //--------- all okey -----------
    let new_id = null;
    if (localStorage.getItem("timers_arr")) {
        //not null
        let timers_arr = JSON.parse(localStorage.getItem("timers_arr"));
        let ids = timers_arr.map(obj => obj.id)

        // ----------------setting new id -------------
        let i = 1;
        while (true) {
            if (ids.includes(i)) {
                i++;
                continue;
            } else {
                new_id = i;
                break;
            }
        }

        // -------------------- new timer -----------------
        let new_timer = {
            id: new_id,
            name,
            finishDateTime: newDate,
            notify: false,
            createdAt: new Date()
        }

        //--------------inserting --------------
        timers_arr.push(new_timer)
        localStorage.setItem('timers_arr', JSON.stringify(timers_arr))
    } else {
        // null
        localStorage.setItem('timers_arr', JSON.stringify(
            [
                {
                    id: 1,
                    name,
                    finishDateTime: newDate,
                    notify: false,
                    createdAt: new Date()
                }
            ]
        ))
    }

    location.reload();

    M.toast({ html: 'Added!' })


}

//-------------------------------- end add new timer-----------------------------------------------


// -------------------------------display timers --------------------------------
(function () {
    let isNew = localStorage.getItem('isNew')
    if (!isNew) {
        // item nai

        localStorage.setItem('isNew', JSON.stringify(true));
        localStorage.setItem('timers_arr', JSON.stringify(
            [
                {
                    id: 1,
                    name: "Medical Admission",
                    finishDateTime: new Date("1 apr 2022"),
                    notify: false,
                    createdAt: new Date()
                },
                {
                    id: 2,
                    name: "Dental Admission",
                    finishDateTime: new Date("7 apr 2022"),
                    notify: false,
                    createdAt: new Date()
                }
            ]
        ));
        location.reload()
    }


    let innerhtmlAll = "";
    let timers_arr = JSON.parse(localStorage.getItem('timers_arr'))
    
    if(!timers_arr) return;

    timers_arr = timers_arr.map(e => ({ id: e.id, name: e.name, remaining: new Date(e.finishDateTime).getTime() }))
    timers_arr.sort((a, b) => a.remaining - b.remaining)

    timers_arr.forEach(timer => {

        //--------------all ok --------------------
        let innerhtml = `
        <div class="card" id=${timer.id}>
            <div class="header">${timer.name}
                <!-- <a class="waves-effect right" href="add.html?edit=${timer.id}">
                    <i class="material-icons">settings</i>
                </a> -->
                <a class="waves-effect right" onclick="deleteTimer(${timer.id})">
                    <i class="material-icons">delete</i>
                </a>
            </div>
            <div>
                <!-- Progress bar 1 -->
                <div class="set-size charts-container">

                    <div class="days pie-wrapper progress-45 style-2">
                        <span class="label"><span class="text">20</span><span class="smaller">DAYS</span></span>
                        <div class="pie">
                            <div class="left-side half-circle"></div>
                            <div class="right-side half-circle"></div>
                        </div>
                        <div class="shadow"></div>
                    </div>

                    <div class="hours pie-wrapper progress-75 style-2">
                        <span class="label"><span class="text">20</span><span class="smaller">HOURS</span></span>
                        <div class="pie">
                            <div class="left-side half-circle"></div>
                            <div class="right-side half-circle"></div>
                        </div>
                        <div class="shadow"></div>
                    </div>

                    <div class="minutes pie-wrapper progress-95 style-2">
                        <span class="label"><span class="text">20</span><span class="smaller">MINUTES</span></span>
                        <div class="pie">
                            <div class="left-side half-circle"></div>
                            <div class="right-side half-circle"></div>
                        </div>
                        <div class="shadow"></div>
                    </div>
                    <div class="seconds pie-wrapper progress-95 progress-950 style-2">
                        <span class="label"><span class="text">20</span><span class="smaller">SECS</span></span>
                        <div class="pie">
                            <div class="left-side half-circle"></div>
                            <div class="right-side half-circle"></div>
                        </div>
                        <div class="shadow"></div>
                    </div>
                </div>
                <!-- END -->
            </div>
        </div>
        
        `
        innerhtmlAll += innerhtml
    })


    document.querySelector(".container").innerHTML += innerhtmlAll;

    
})()
// -------------------------------end display timers --------------------------------

//-------------------------------interval of timer ----------------------------------
let timerInterval = setInterval(runTimer, 1000);
function runTimer() {
    let timers_arr = JSON.parse(localStorage.getItem('timers_arr'))
    timers_arr.forEach(timer => {

        let finishDateTime = new Date(timer.finishDateTime).getTime();
        let [createdAtDaysDiff] = msToDHMS(finishDateTime - new Date(timer.createdAt).getTime());
        let timer_el = document.getElementById(timer.id)

        let now = new Date().getTime()
        let [days, hours, minutes, seconds] = msToDHMS(finishDateTime - now);

        //----------------manupulate dom---------------
        timer_el.querySelector('.days .label .text').textContent = days;
        timer_el.querySelector('.hours .label .text').textContent = hours;
        timer_el.querySelector('.minutes .label .text').textContent = minutes;
        timer_el.querySelector('.seconds .label .text').textContent = seconds;

        //----------------manupulating css --------------------
        timer_el.querySelector('.seconds .left-side').style.transform = `rotate(${Math.abs(seconds) * 6}deg)`;
        if (Math.abs(seconds) > 30) {
            timer_el.querySelector('.seconds .right-side').style.display = "block";
            timer_el.querySelector('.seconds .right-side').style.transform = "rotate(180deg)";


            timer_el.querySelector('.seconds .pie').style.clip = "rect(auto, auto, auto, auto)";
        } else {
            timer_el.querySelector('.seconds .right-side').style.display = "none";

            timer_el.querySelector('.seconds .pie').style.clip = "rect(0, 1em, 1em, 0.5em)";
        }
        // console.log("[executing]")
        // eta always change hobe na 1 second por por
        timer_el.querySelector('.minutes .left-side').style.transform = `rotate(${Math.abs(minutes) * 6}deg)`;
        if (Math.abs(minutes) > 30) {
            timer_el.querySelector('.minutes .right-side').style.display = "block";
            timer_el.querySelector('.minutes .right-side').style.transform = "rotate(180deg)";

            timer_el.querySelector('.minutes .pie').style.clip = "rect(auto, auto, auto, auto)";
        } else {
            timer_el.querySelector('.minutes .right-side').style.display = "none";

            Math
            timer_el.querySelector('.minutes .pie').style.clip = "rect(0, 1em, 1em, 0.5em)";
        }


        // eta always change hobe na 1 second por por
        timer_el.querySelector('.hours .left-side').style.transform = `rotate(${Math.abs(hours) * 15}deg)`;
        if (Math.abs(hours) > 12) {

            timer_el.querySelector('.hours .right-side').style.display = "block";
            timer_el.querySelector('.hours .right-side').style.transform = "rotate(180deg)";

            timer_el.querySelector('.hours .pie').style.clip = "rect(auto, auto, auto, auto)";
        } else {
            timer_el.querySelector('.hours .right-side').style.display = "none";


            timer_el.querySelector('.hours .pie').style.clip = "rect(0, 1em, 1em, 0.5em)";
        }


        let actual = createdAtDaysDiff <= 0 ? 0 : parseInt(360 / createdAtDaysDiff * days)

        // console.log(timer.id, " : " ,createdAtDaysDiff)
        // console.log(timer.id, " : " ,actual)

        timer_el.querySelector('.days .left-side').style.transform = `rotate(${actual}deg)`;
        if (Math.abs(days) > createdAtDaysDiff / 2) {
            timer_el.querySelector('.days .right-side').style.display = "block";
            timer_el.querySelector('.days .right-side').style.transform = "rotate(180deg)";

            timer_el.querySelector('.days .pie').style.clip = "rect(auto, auto, auto, auto)";
        } else {
            timer_el.querySelector('.days .right-side').style.display = "none";


            timer_el.querySelector('.days .pie').style.clip = "rect(0, 1em, 1em, 0.5em)";
        }


        //console.log([days, hours, minutes, seconds])
    })
}
//-------------------------------end interval of timer ----------------------------------


//-------------------------------- parseMili func -------------------------------------
function msToDHMS(ms) {
    // console.log(ms)
    // 1- Convert to seconds:
    let seconds = ms / 1000;

    // 1- Extract days:
    const days = parseInt(seconds / 86400);
    seconds = seconds % 86400;
    // 2- Extract hours:
    const hours = parseInt(seconds / 3600); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    const minutes = parseInt(seconds / 60); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = parseInt(seconds % 60);
    return [days, hours, minutes, seconds]
}
//-------------------------------- parseMili func -------------------------------------

// ---------------------------------------deleteTimer------------------------------------
function deleteTimer(id) {
    console.log('deleted', " : ", id)
    let timers_arr = JSON.parse(localStorage.getItem('timers_arr'))
    for (let i = 0; i < timers_arr.length; i++) {
        if (id == timers_arr[i].id) {
            timers_arr.splice(i, 1) //1ta uray deo
            break;
        }
    }
    localStorage.setItem('timers_arr', JSON.stringify(timers_arr))
    location.reload();

    M.toast({ html: 'Deleted!' })
}
// -----------------------------------------------end deleteTimer -------------------------

//- ------------------------------------------- add name date -------------------------

function addNameDate(name, dateTime) {

    console.log(name, dateTime)
    let newDate = new Date(dateTime);

    if (name == "Tomorrow") {
        newDate = new Date()
        newDate.setDate(newDate.getDate() + 1)
        newDate.setHours(0)
        newDate.setMinutes(0)
        newDate.setSeconds(0)
    }


    console.log(newDate)

    //--------- all okey -----------
    let new_id = null;
    if (localStorage.getItem("timers_arr")) {
        //not null
        let timers_arr = JSON.parse(localStorage.getItem("timers_arr"));
        let ids = timers_arr.map(obj => obj.id)

        // ----------------setting new id -------------
        let i = 1;
        while (true) {
            if (ids.includes(i)) {
                i++;
                continue;
            } else {
                new_id = i;
                break;
            }
        }

        // -------------------- new timer -----------------
        let new_timer = {
            id: new_id,
            name,
            finishDateTime: newDate,
            notify: false,
            createdAt: new Date()
        }

        //--------------inserting --------------
        timers_arr.push(new_timer)
        localStorage.setItem('timers_arr', JSON.stringify(timers_arr))
    } else {
        // null
        localStorage.setItem('timers_arr', JSON.stringify(
            [
                {
                    id: 1,
                    name,
                    finishDateTime: newDate,
                    notify: false,
                    createdAt: new Date()
                }
            ]
        ))
    }

    location.reload();

    M.toast({ html: 'Added!' })
}