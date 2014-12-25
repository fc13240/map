package org.ysc.mvcdemo.servlet ;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
public class SensorRegisterServlet extends HttpServlet {
	public void doGet(HttpServletRequest req,HttpServletResponse resp) throws ServletException,IOException{
		String path = "register.jsp" ;
		String urlParameters = req.getParameter("request");
		List<String> info = new ArrayList<String>() ;	// �ռ�����
		URL url = new URL("http://localhost:8080/SOS/sos");
		URLConnection conn = null;
		try {
			conn = url.openConnection();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		conn.setDoOutput(true);

		OutputStreamWriter writer = null;
		try {
			writer = new OutputStreamWriter(conn.getOutputStream());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		try {
			writer.write(urlParameters);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			writer.flush();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		String line;
		BufferedReader reader = null;
		try {
			reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

		try {
			while ((line = reader.readLine()) != null) {
			   info.add(line);
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			writer.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			reader.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		StringBuffer sb = new StringBuffer(); 
		if(info != null){	// ����Ϣ����
			for (int i = 0; i < info.size(); i++) 
			{ 
				sb.append(info.get(i)); 
			}
		}
		String information=sb.toString();
		String message;
		if(information.indexOf("is already registered")!=-1){
			message="<?xml version=\"1.0\" encoding=\"UTF-8?\">"+"\n"
					+ "<InsertSensorResponse> "+"\n"
					+ "<value>" +"\n"
					+" ������ע��ʧ��,�ô�������ע����SOS�С�"+"\n"
					+ " </value>"+"\n"
					+ "</InsertSensorResponse>";
		}else if(information.indexOf("ExceptionText")!=-1){
			message="<?xml version=\"1.0\" encoding=\"UTF-8?\">"+"\n"
					+ "<InsertSensorResponse> "+"\n"
					+ "<value>" +"\n"
					+" ������ע��ʧ�ܣ�������ȷ��SensorML�ĵ���"+"\n"
					+ " </value>"+"\n"
					+ "</InsertSensorResponse>";
			
		}else{
			message="<?xml version=\"1.0\" encoding=\"UTF-8?\">"+"\n"
		            +"<InsertSensorResponse> "+"\n"
					+ "<value>" +"\n"
					+" ������ע��ɹ�"+"\n"
					+ " </value>"+"\n"
					+ "</InsertSensorResponse>";
		}

		req.setAttribute("message",message) ;
		req.getRequestDispatcher(path).forward(req,resp) ;
	}
	public void doPost(HttpServletRequest req,HttpServletResponse resp) throws ServletException,IOException{
		this.doGet(req,resp) ;
	}


}