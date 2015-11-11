(function () {
	angular
		.module( 'pokerManager' )
		.service( 'playerModal', PlayerModal );

	PlayerModal.$inject = [ '$uibModal', 'Players' ];
	function PlayerModal( $modal, Players ) {
		this.$modal = $modal;
		this.Players = Players;
	}

	PlayerModal.prototype = {
		open: function ( player ) {
			var isNew = ( typeof( player ) === 'undefined' || player === null );

			if (isNew) {
				player = this.Players.create();
			}
			var modalInstance = this.$modal.open( {
				templateUrl: './partials/modals/addNewPlayer.html',
				controller: 'ModalPlayerDetailsCtrl',
				controllerAs: 'modalCtrl',
				bindToController: true,
				resolve: {
					player: function() {
						return player;
					}
				}
			} );

			return modalInstance.result;
		}
	};
}());
