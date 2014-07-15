var myapp = angular.module('myapp', ['ui', 'ui.bootstrap', 'ui.sortable']);

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
    console.log($scope.statusMap);
    $scope.ok = function() {
        $modalInstance.close(card);
    };

    $scope.delete = function() {
        $modalInstance.close('delete');
    };

    $scope.cancel = function() {
        $modalInstance.close('cancel');
    };
};

var TaskCtrl = function($scope, $http, $location, $modal, $q) {
    if (!localStorage.user) {
        localStorage.user = prompt("ユーザ名を入力して下さい。");
    }

    $scope.openCard = function(argCard) {
        $scope.openModal(argCard);
    };

    function loadTickets() {
        if ($scope.selectedBoard) {
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
            console.log($scope.selectedBoard);
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
            if (selectedItem === "delete") {
                $http.delete("/boards/" + $scope.selectedBoard.name + "/tickets/" + card._id).success(function() {
                    loadTickets();
                });
            } else if (selectedItem === "cancel") {
                //card = backupCard;
            } else {
                card = selectedItem;
                $http.put("/boards/" + $scope.selectedBoard.name + "/tickets/" + card._id, card).success(function() {
                    console.log("Updated");
                    loadTickets();
                });
            }

        }, function() {});
    };
    $scope.deleteBoard = function(board) {
        $http.delete("/boards/" + board._id).success(function() {
            reloadBoards();
        });
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

        $http.post("/boards/" + $scope.selectedBoard.name + "/tickets/", item).success(function() {
            line.cards.unshift();
            addObj.name = "";
            loadTickets();

            return false;
        });
    };
    
    var oldList, newList, item;
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
                $http.put("/boards/" + $scope.selectedBoard.name + "/tickets/" + itemId, {
                    status: toList
                }).success(function(){
                    loadBadges();
                });
            }
        }
    };

};
myapp.controller('controller', TaskCtrl);
