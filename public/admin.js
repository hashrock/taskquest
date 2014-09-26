var myapp = angular.module('myapp', ['ui', 'ui.bootstrap', 'ui.sortable']);

var TaskCtrl = function($scope, $http) {
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

    //ready
    reloadTickets();
    reloadBoards();


    $scope.deleteBoard = function(board) {
        $http.delete("/boards/" + board._id).success(function() {
            reloadBoards();
        });
    };

    $scope.archiveCard = function(card){
        $http.put("/tickets/" + card._id , {
            status: "archive"
        }).success(function(){
            reloadTickets();
        });
    };

    $scope.deleteCard = function(card){
        $http.delete("/tickets/" + card._id).success(function() {
            reloadTickets();
        });
    };


};
myapp.controller('controller', TaskCtrl);
