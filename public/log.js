var myapp = angular.module('myapp', ['ui', 'ui.bootstrap', 'ui.sortable']);

var TaskCtrl = function($scope, $http) {


    function reloadTickets(){
        $http.get("/logs/").success(function(data){
            $scope.ticketList = data;
        });
    }

    reloadTickets();
};
myapp.controller('controller', TaskCtrl);
