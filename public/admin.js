var myapp = angular.module('myapp', ['ui', 'ui.bootstrap']);

var TaskCtrl = function($scope, $http, $location, $q) {
    function reloadBoards() {
        $http.get("/boards/").success(function(data) {
            $scope.boardList = data;
        });
    }

    function reloadTickets(){
        $http.get("/tickets/").success(function(data){
            $scope.ticketList = data;
        });
    }


    reloadTickets();
    reloadBoards();

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

};
myapp.controller('controller', TaskCtrl);
