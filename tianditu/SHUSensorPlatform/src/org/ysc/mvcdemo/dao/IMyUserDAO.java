package org.ysc.mvcdemo.dao;

import java.util.* ;

import org.ysc.mvcdemo.vo.MyUser;
public interface IMyUserDAO {
	// ������ɵ��ǵ�½��֤����ô��½����ֻ�����ַ��ؽ��
	public boolean findLogin(MyUser user) throws Exception ;
	public boolean userRegister(MyUser user) throws Exception ;
} 