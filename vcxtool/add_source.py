# change a vcxproj project

import os
from xml.etree import ElementTree as ET

class Vcx:
    ns = "http://schemas.microsoft.com/developer/msbuild/2003"
    ET.register_namespace('', ns)
    ns = "{" + ns + "}"
    
    CL_COM = 'ClCompile'
    CL_INC = 'ClInclude'
    CL_FILTER = 'Filter'
    CL_GROUP = 'ItemGroup'
    
    # base filter
    BASE = "Source Files"
    
    # remove xml ns
    @staticmethod
    def tagged(tag):
        return tag.replace(Vcx.ns,'');
    
    # unix path
    @staticmethod
    def unixPath(path):
        return path.replace("\\", "/")
    
    # is source or header
    @staticmethod
    def fileType(path):
        if path.endswith('.c') or path.endswith('.cc') or path.endswith('.cpp'):
            return 1;
        if path.endswith('.h') or path.endswith('.hpp'):
            return 2;
        return -1;
    
    # open a project file
    def __init__(self, path):
        self.vcx = path;
        self.fil = path + ".filters";
        self.vcx_tree = ET.parse(self.vcx)
        self.vcx_root = self.vcx_tree.getroot()
        self.fil_tree = ET.parse(self.fil)
        self.fil_root = self.fil_tree.getroot()
        
        # project dir
        self.dst = os.path.dirname(os.path.abspath(self.vcx))
        self.dst = Vcx.unixPath(self.dst)
    
    # Find the ItemGroup where there are ClCompile and ClInclude
    @staticmethod
    def itemGroup(root, tag):
        lst = [];
        for i in root.iter(Vcx.ns + Vcx.CL_GROUP):
            j = i.find(Vcx.ns + tag)
            if j is not None:
                lst.append(i)
        return lst
    
    # formulate xml tree
    @staticmethod
    def indent(elem, level=0):
        i = "\n" + level * "  "
        if len(elem):
            if not elem.text or not elem.text.strip():
                elem.text = i + "  "
            if not elem.tail or not elem.tail.strip():
                elem.tail = i
            for elem in elem:
                Vcx.indent(elem, level+1)
            if not elem.tail or not elem.tail.strip():
                elem.tail = i
        else:
            if level and (not elem.tail or not elem.tail.strip()):
                elem.tail = i
                
    # whether a folder should be added, ie.
    # whether it contains source or header files
    @staticmethod
    def containsCPP(path):
        if os.path.basename(path).startswith('.'):
            # hidden file
            return False
        ok = False;
        for i in os.listdir(path):
            j = os.path.join(path, i);
            if os.path.isfile(j) and Vcx.fileType(i) > 0:
                return True;
            
            if os.path.isdir(j):
                ok = Vcx.containsCPP(j);
                if ok:
                    return True;
        return False;
        
                
    # add a file under which filter
    def add_file(self, path, filter = None, relative = True):
        r = os.path.relpath(path, self.dst) if relative else path
        r = Vcx.unixPath(r)
        if Vcx.fileType(path) <= 0:
            # not c related
            return
        if Vcx.fileType(path) == 1:
            # source
            tag = Vcx.CL_COM
        if Vcx.fileType(path) == 2:
            # header
            tag = Vcx.CL_INC
            
        lst1 = Vcx.itemGroup(self.vcx_root, tag);
        lst2 = Vcx.itemGroup(self.fil_root, tag);
        
        if len(lst1) == 0:
            a = ET.SubElement(self.vcx_root, Vcx.ns + Vcx.CL_GRPUP)
            lst1.append(a)
        if len(lst2) == 0:
            b = ET.SubElement(self.fil_root, Vcx.ns + Vcx.CL_GRPUP)
            lst2.append(b)
        
        # -- whether it is already in lst1
        for i in lst1:
            for j in i:
                if j.tag == Vcx.ns + tag:
                    if Vcx.unixPath(j.attrib['Include']) == r:
                        print(r, 'exists');
                        return;
        
        print('adding', r);
        a = ET.SubElement(lst1[0], Vcx.ns + tag)
        a.attrib['Include'] = r
        
        a = ET.SubElement(lst2[0], Vcx.ns + tag)
        a.attrib['Include'] = r
        if filter is not None:
            b = ET.SubElement(a, Vcx.ns + "Filter")
            b.text = filter
            
    # add a folder under which filter. The folder name
    # becomes the sub-filter
    def add_folder(self, path, filter = BASE, relative = True):
        fd = os.path.basename(path);
        sub_filter = filter + "\\" + fd;
        lstf = Vcx.itemGroup(self.fil_root, Vcx.CL_FILTER);
        if len(lstf)==0:
            a = ET.SubElement(self.fil_root, Vcx.CL_GROUP);
            lstf.append(a);
        
        # -- whether it is already in lstf
        has_filter = False;
        for i in lstf:
            for j in i:
                if j.tag == Vcx.ns + Vcx.CL_FILTER:
                    if j.attrib['Include'] == sub_filter:
                        print('filter', sub_filter, 'exists');
                        has_filter = True; break;
        
        if not has_filter:
            print('adding filter ---', sub_filter)
            a = ET.SubElement(lstf[0], Vcx.ns + Vcx.CL_FILTER)
            a.attrib['Include'] = sub_filter
        
        # add files to sub_filter
        for i in os.listdir(path):
            j = os.path.join(path, i);
            if os.path.isfile(j):
                self.add_file(j, filter = sub_filter, relative = relative)
                continue
            if os.path.isdir(j):
                if Vcx.containsCPP(j):
                    self.add_folder(j, filter = sub_filter, relative = relative)
        
        
    def flush(self):
        Vcx.indent(self.vcx_root)
        Vcx.indent(self.fil_root)
        self.vcx_tree.write(self.vcx, encoding='utf-8');
        self.fil_tree.write(self.fil, encoding='utf-8');
        
        
        
    
    
    

    

