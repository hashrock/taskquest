var myapp = angular.module('myapp', ['ui', 'ui.bootstrap', 'ui.sortable'])
        .filter('removeTag', function() {
            return function(input) {
                return input.replace(/\[[^\]]*\]/g, "");
            };
        })
        .filter('findTag', function() {
            return function(input) {
                var matches = input.match(/\[[^\]]*\]/g);
                if(matches){
                    return matches.map(function(item){return item.replace(/[\[\]]/g,"");});
                }
                return [];
            };
        });

function getStatusMap() {
    return [{
        _id: "1",
        title: "未定",
        status: "backlog"
    }, {
        _id: "2",
        title: "今週やる",
        status: "sprint1"
    }, {
        _id: "3",
        title: "来週やる",
        status: "sprint2"
    }, {
        _id: "4",
        title: "再来週やる",
        status: "sprint3"
    }, {
        _id: "5",
        title: "作業 or レビュー中",
        status: "doing"
    }, {
        _id: "6",
        title: "終わり",
        status: "done"
    }];
}

var ModalInstanceCtrl = function($scope, $modalInstance, card) {
    $scope.card = card;
    $scope.statusMap = getStatusMap();
    $scope.ok = function() {
        $modalInstance.close(card);
    };

    $scope.delete = function() {
        $modalInstance.close('delete');
    };

    $scope.archive = function () {
        $modalInstance.close('archive');
    };



    $scope.cancel = function() {
        $modalInstance.close('cancel');
    };
};

var TaskCtrl = function($scope, $http, $location, $modal, $q) {
    var oldList, newList, item;

    if (!localStorage.user) {
        localStorage.user = prompt("ユーザ名を入力して下さい。");
    }

    $scope.openCard = function(argCard) {
        $scope.openModal(argCard);
    };

    function loadTickets() {
        if ($scope.selectedBoard) {
            $http.get("/logs/").success(function(data){
                $scope.logList = data;
            });


            $http.get("/boards/" + $scope.selectedBoard.name).success(function(result) {
                $scope.linesAry = [
                    [{

                        _id: "1",
                        title: "未定",
                        status: "backlog",
                        cards: result.backlog
                    }],
                    [{
                        _id: "2",
                        title: "今週やる",
                        status: "sprint1",
                        cards: result.sprint1
                    }, {
                        _id: "3",
                        title: "来週やる",
                        status: "sprint2",
                        cards: result.sprint2
                    }, {
                        _id: "4",
                        title: "再来週やる",
                        status: "sprint3",
                        cards: result.sprint3
                    }],
                    [{
                        _id: "5",
                        title: "作業 or レビュー中",
                        status: "doing",
                        cards: (result.doing ? result.doing : [])
                    }, {
                        _id: "6",
                        title: "終わり",
                        status: "done",
                        cards: (result.done ? result.done : [])
                    }]
                ];
            });
        }
    }

    function loadBadges() {
        var promise = $http.get("/api/users");
        var users;
        promise.then(function(result) {
            return result.data;
        }).then(function(userList) {
            users = userList;
            var promises = userList.map(function(item) {
                return $http.get("/api/users/" + item + "/sprint1");
            });
            return $q.all(promises);
        }).then(function(result) {
            $scope.userList = result.map(function(obj, index) {
                return {
                    user: users[index],
                    task: obj.data
                };
            });
        });
    }


    function reloadBoards() {
        $http.get("/boards/").success(function(data) {
            $scope.boardList = data;
            var selectedBoardName = $location.path();
            $scope.selectedBoard = _.find(data, function(item) {
                return ("/" + item.name === selectedBoardName);
            });
        });
    }

    $scope.$watch("selectedBoard", function() {
        if ($scope.selectedBoard) {
            loadTickets();
            $location.path("/" + $scope.selectedBoard.name);
        }
    });

    loadTickets();
    loadBadges();
    reloadBoards();

    $scope.isUserMe = function(user) {
        return user === localStorage.user;
    };

    $scope.newBoard = function() {
        var boardName = prompt("New Board Name");
        if (boardName) {
            $http.post("/boards/", {
                name: boardName
            }).success(function() {
                reloadBoards();
            });

        }
    };

    $scope.openModal = function(card) {
        var modalInstance = $modal.open({
            templateUrl: 'myModalContent.html',
            controller: ModalInstanceCtrl,
            resolve: {
                card: function() {
                    return _.clone(card);
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {
            switch(selectedItem){
                case "delete" :
                    $http.delete("/tickets/" + card._id).success(function() {
                        loadTickets();
                    });
                    break;
                case "archive" :
                    archiveCard(card)
                        .then(function(){
                            loadTickets();
                        });
                    break;

                case "cancel":
                    //card = backupCard;
                    break;

                default:
                    card = selectedItem;
                    $http.put("/tickets/" + card._id, card).success(function() {
                        console.log("Updated");
                        loadTickets();
                    });
            }
        }, function() {});
    };


    $scope.addCard = function(line, addObj) {
        if (!addObj || addObj.name.trim().length === 0) {
            return;
        }
        var item = {
            name: addObj.name,
            icon: "slime",
            status: line.status,
            user: localStorage.user,
            board: $scope.selectedBoard._id
        };

        $http.post("/tickets/", item).success(function() {
            line.cards.unshift();
            addObj.name = "";
            loadTickets();

            return false;
        });
    };

    function archiveCard(card){
        var deferred = $q.defer();

        $http.put("/tickets/" + card._id , {
            status: "archive"
        }).success(function(){
            return deferred.resolve({result: "success"});
        });
        return deferred.promise;
    }

    $scope.archiveCards = function(cards){
        if(window.confirm('クリアしてよろしいですか？')){
            var promises = cards.map(function(card){
                return archiveCard(card);
            });

            $q.all(promises).then(function(){
                loadTickets();
                reloadTickets();
            }).done();
        }
    };

    $scope.sortableOptions = {
        helper : 'clone', //Prevent extra click event in FF
        connectWith: ".apps-container",
        start: function(event, ui) {
            item = ui.item;
            newList = oldList = ui.item.parent();
        },
        change: function(event, ui) {
            if(ui.sender){
                newList = ui.placeholder.parent();
            }
        },
        stop: function() {
            var fromList = oldList.attr("data-status");
            var toList = newList.attr("data-status");
            if(fromList !== toList){
                var itemId = item.attr("data-id");

                $http.put("/tickets/" + itemId, {
                    status: toList
                }).success(function(){
                    loadBadges();
                });
            }
        }
    };



    // --------------------------------
    // Calender View Start
    // --------------------------------

    var width = 700,
        height = 90,
        cellSize = 12; // cell size

    var day = d3.time.format("%w"),
        week = d3.time.format("%U"),
        format = d3.time.format("%Y-%m-%d");

    var color = d3.scale.quantize()
        .domain([0, 4])
        .range(d3.range(4).map(function(d) { return "q" + d + "-11"; }));

    var thisYear = new Date().getFullYear();
    var svg = d3.select("#calendar").selectAll("svg")
        .data([thisYear])
        .enter().append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "RdYlGn")
        .append("g")
        .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

    var rect = svg.selectAll(".calender-day")
        .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
        .enter().append("rect")
        .attr("class", "calender-day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function(d) { return week(d) * cellSize; })
        .attr("y", function(d) { return day(d) * cellSize; })
        .datum(format);

    rect.append("title")
        .text(function(d) { return d; });

    svg.selectAll(".calender-month")
        .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
        .enter().append("path")
        .attr("class", "calender-month")
        .attr("d", monthPath);

    function updateCalendar(logList){
        var data = {};

        logList.forEach(function(item){
            var createdAt = format(new Date(item.createdAt));
            data[createdAt] = data[createdAt] ? data[createdAt]+1 : 1;
        });

        rect.filter(function(d) { return d in data; })
            .attr("class", function(d) { return "calender-day " + color(data[d]); })
            .select("title")
            .text(function(d) { return d + ": " + data[d] + " contributes"; });
    }


    function monthPath(t0) {
        var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
            d0 = +day(t0), w0 = +week(t0),
            d1 = +day(t1), w1 = +week(t1);
        return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
            + "H" + w0 * cellSize + "V" + 7 * cellSize
            + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
            + "H" + (w1 + 1) * cellSize + "V" + 0
            + "H" + (w0 + 1) * cellSize + "Z";
    }

    function reloadLogs(){
        $http.get("/logs/?status=done&limit=1000&user=" + localStorage.user).success(function(data){
            $scope.logList = data;
            updateCalendar(data);
        });
        $http.get("/logs/?limit=20").success(function(data){
            $scope.recentlogList = data;
        });
    }

    //ready
    reloadLogs();
    // --------------------------------
    // Calender View End
    // --------------------------------

};
myapp.controller('controller', TaskCtrl);
