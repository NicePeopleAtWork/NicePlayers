package com.npaw.vo;

import java.io.File;
import java.util.HashMap;

public class MediaAsset extends HashMap<String, String> {

	private static final long serialVersionUID = 1L;

	public MediaAsset(String uri) {
		this(uri, false, null, null);
	}

	public MediaAsset(String name, String uri) {
		this(name, uri, false, null, null);
	}

	public MediaAsset(String uri, boolean usesWidevine, String portalName,
			String drmServerUri) {
		this(null, uri, usesWidevine, portalName, drmServerUri);
	}

	public MediaAsset(String name, String uri, boolean usesWidevine,
			String portalName, String drmServerUri) {
		super();
		this.put("uri", uri);
		this.put("usesWidevine", String.valueOf(usesWidevine));
		this.put("portalName", portalName != null ? portalName : "-");
		this.put("drmServerUri", drmServerUri != null ? drmServerUri : "-");

		// get name from URI
		this.put("name", name == null ? new File(uri).getName() : name);
	}

	public String getUri() {
		return this.get("uri");
	}

	public String getName() {
		return this.get("name");
	}

	public boolean isUsesDrm() {
		return Boolean.valueOf(this.get("usesWidevine"));
	}

	public String getPortalName() {
		return this.get("portalName");
	}

	public String getDrmServerUri() {
		return this.get("drmServerUri");
	}
}
