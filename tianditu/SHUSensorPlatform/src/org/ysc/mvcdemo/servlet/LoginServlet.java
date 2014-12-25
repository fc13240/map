package org.ysc.mvcdemo.servlet ;
import java.io.* ;
import java.util.* ;
import javax.servlet.* ;
import javax.servlet.http.* ;
import org.ysc.mvcdemo.factory.* ;
import org.ysc.mvcdemo.vo.* ;
public class LoginServlet extends HttpServlet {
	public void doGet(HttpServletRequest req,HttpServletResponse resp) throws ServletException,IOException{
		String path = "SpatialInformationPlatform.jsp" ;
		String userid = req.getParameter("userid") ;
		String userpass = req.getParameter("userpass") ;
		List<String> info = new ArrayList<String>() ;	// �ռ�����
		if(userid==null || "".equals(userid)){
			info.add("�û�id����Ϊ�գ�") ;
		}
		if(userpass==null || "".equals(userpass)){
			info.add("���벻��Ϊ�գ�") ;
		}
		if(info.size()==0){	// ����û�м�¼�κεĴ���
			MyUser user = new MyUser() ;
			user.setUserid(userid) ;
			user.setPassword(userpass) ;
			try{
				if(DAOFactory.getIUserDAOInstance().findLogin(user)){
					info.add("�û���½�ɹ�����ӭ" + user.getName() + "���٣�") ;
				} else {
					info.add("�û���½ʧ�ܣ�������û��������룡") ;
				}
			}catch(Exception e){
				e.printStackTrace() ;
			}
		}
		req.setAttribute("info",info) ;
		req.getRequestDispatcher(path).forward(req,resp) ;
	}
	public void doPost(HttpServletRequest req,HttpServletResponse resp) throws ServletException,IOException{
		this.doGet(req,resp) ;
	}


}