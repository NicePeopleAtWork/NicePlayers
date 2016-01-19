package com.npaw.test;

import android.app.Activity;
import android.app.ListActivity;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;

import com.npaw.vo.MediaAsset;
import com.widevine.demo.VideoViewWidevineActivity;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class MainListActivity extends ListActivity {

    private MediaAdapter adapter;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        ArrayList<MediaAsset> l = new ArrayList<MediaAsset>();
        adapter = new MediaAdapter(l, getApplicationContext(),
                R.layout.stream_row);
        setListAdapter(adapter);

        new AsynConfigurationLoader().execute();
    }

    @Override
    public void onListItemClick(ListView l, View v, int position, long id) {
        MediaAsset item = (MediaAsset) l.getItemAtPosition(position);

        // activity regarding if asset uses DRM, VideoView or MediaPlayer or
        // ExtendingVideoView
        Class<? extends Activity> c = item.isUsesDrm() ? VideoViewWidevineActivity.class
                : item.getName().indexOf("VideoView") >= 0 ? VideoViewActivity.class
                : MediaPlayerActivity.class;

        if (item.getName().indexOf("Extending") >= 0) {
            c = ExtendingVideoViewActivity.class;
        }

        Intent intent = new Intent(this, c);
        intent.putExtra("uri", item.getUri());
        if (item.isUsesDrm()) {
            intent.putExtra("portalName", item.getPortalName());
            intent.putExtra("drmServerUri", item.getDrmServerUri());
        }
        intent.putExtra("title", item.getName());

        if(item.getName().indexOf("force_error_retry") >=0){
            intent.putExtra("force_error_retry", true);
        }
        startActivity(intent);
    }

    private class AsynConfigurationLoader extends
            AsyncTask<Void, Void, List<MediaAsset>> {
        private final ProgressDialog dialog = new ProgressDialog(
                MainListActivity.this);

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            dialog.setMessage("Downloading configuration...");
            dialog.show();
        }

        protected List<MediaAsset> doInBackground(Void... params) {
            List<MediaAsset> assets = new ArrayList<MediaAsset>();
            HttpURLConnection conn = null;
            InputStream is = null;
            try {
                URL urlConf = new URL(Settings.JSON_CONF);
                conn = (HttpURLConnection) urlConf.openConnection();
                conn.setRequestMethod("GET");
                conn.connect();

                is = conn.getInputStream();

                String line = "";
                BufferedReader br = new BufferedReader(new InputStreamReader(is));
                String json = "";
                while (line != null) {
                    line = br.readLine();
                    if (line != null) {
                        json = json + line;
                    }
                }

                if (json.startsWith("{") == false) {
                    json = "{" + json;
                }
                JSONObject jsonConf = new JSONObject(json);
                String account = jsonConf.getString("account");
                String user = jsonConf.getString("user");
                String ssOrigin = jsonConf.getString("ssOrigin");
                String ssOriginError = jsonConf.getString("ssOriginError");

                Settings.NPAW_SYSTEM = account;
                Settings.NPAW_USER = user;

                JSONArray videosArray = jsonConf.getJSONArray("videos");
                for (int i = 0; i < videosArray.length(); i++) {
                    JSONObject video = videosArray.getJSONObject(i);
                    String title = video.getString("title");
                    String url = video.getString("url");
                    boolean wv = false;
                    if (video.has("widevine")) {
                        wv = video.getBoolean("widevine");
                    }
                    String wvPortal = "";
                    String wvLicenseUrl = "";
                    if (video.has("wvPortal")) {
                        wvPortal = video.getString("wvPortal");
                    }
                    if (video.has("wvLicense")) {
                        wvLicenseUrl = video.getString("wvLicense");
                    }
                    MediaAsset asset = null;
                    if (wv == false) {
                        asset = new MediaAsset(title, url);
                    } else {
                        asset = new MediaAsset(title, url, true, wvPortal,
                                wvLicenseUrl);
                    }
                    assets.add(asset);
                }
            } catch (MalformedURLException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            } catch (JSONException e) {
                e.printStackTrace();
            } finally {
                if (is != null) {
                    try {
                        is.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
                if (conn != null)
                    conn.disconnect();
            }

            return assets;
        }

        @Override
        protected void onPostExecute(List<MediaAsset> result) {
            super.onPostExecute(result);
            dialog.dismiss();
            adapter.setAssets(result);
            adapter.notifyDataSetChanged();
        }

    }

    private class MediaAdapter extends ArrayAdapter<MediaAsset> {

        private List<MediaAsset> assets;
        private Context ctx;

        public MediaAdapter(List<MediaAsset> assets, Context context,
                            int resource) {
            super(context, R.layout.stream_row, assets);
            this.assets = assets;
            this.ctx = context;
        }

        public void setAssets(List<MediaAsset> assets) {
            this.assets = assets;
        }

        @Override
        public int getCount() {
            if (assets != null) {
                return assets.size();
            }
            return 0;
        }

        @Override
        public MediaAsset getItem(int position) {
            if (assets != null) {
                return assets.get(position);
            } else {
                return null;
            }
        }

        @Override
        public long getItemId(int position) {
            if (assets != null) {
                return assets.get(position).hashCode();
            } else {
                return 0;
            }
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            View v = convertView;
            if (v == null) {
                LayoutInflater inflater = (LayoutInflater) ctx
                        .getSystemService(Context.LAYOUT_INFLATER_SERVICE);
                v = inflater.inflate(R.layout.stream_row, null);
            }
            MediaAsset asset = assets.get(position);
            TextView name = (TextView) v.findViewById(R.id.name);
            name.setText(asset.getName());
            TextView uri = (TextView) v.findViewById(R.id.description);
            uri.setText(asset.getUri());
            return v;
        }
    }
}