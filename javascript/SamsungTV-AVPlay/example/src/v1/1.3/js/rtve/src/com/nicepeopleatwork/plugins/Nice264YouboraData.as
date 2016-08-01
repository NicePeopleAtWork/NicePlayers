package com.nicepeopleatwork.plugins
{
	public class Nice264YouboraData
	{
		private var _system;
		private var _isLive;
		private var _username;
		private var _mediaData;
		private var _service;
		private var _drmType;
		private var _resource;
		public function Nice264YouboraData()
		{
		}

		public function get resource()
		{
			return _resource;
		}

		public function set resource(value):void
		{
			_resource = value;
		}

		public function get drmType()
		{
			return _drmType;
		}

		public function set drmType(value):void
		{
			_drmType = value;
		}

		public function get service()
		{
			return _service;
		}

		public function set service(value):void
		{
			_service = value;
		}

		public function get mediaData()
		{
			return _mediaData;
		}

		public function set mediaData(value):void
		{
			_mediaData = value;
		}

		public function get username()
		{
			return _username;
		}

		public function set username(value):void
		{
			_username = value;
		}

		public function get isLive()
		{
			return _isLive;
		}

		public function set isLive(value):void
		{
			_isLive = value;
		}

		public function get system()
		{
			return _system;
		}

		public function set system(value):void
		{
			_system = value;
		}

	}
}