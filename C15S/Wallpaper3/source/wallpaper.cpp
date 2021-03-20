﻿#include "wallpaper.h"
#include "ui_wallpaper.h"
#include "utils.h"
#include <QCloseEvent>
#include <QWebEngineProfile>
#include <QSystemTrayIcon>
#include <QFile>

using namespace std;

Wallpaper::Wallpaper(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::Wallpaper)
{
    ui->setupUi(this);
    this->init();

    mSysTrayIcon = new QSystemTrayIcon(this);
    QIcon icon = QIcon(":/images/icon.png");
    mSysTrayIcon->setIcon(icon);
    mSysTrayIcon->setToolTip("Wallpaper");
    connect(mSysTrayIcon,SIGNAL(activated(QSystemTrayIcon::ActivationReason)),this,SLOT(on_activatedSysTrayIcon(QSystemTrayIcon::ActivationReason)));
    createActions();
    createMenu();
    mSysTrayIcon->show();

    QWebEngineProfile::NoCache;
    view = new QWebEngineView();
    view->setWindowFlags(Qt::Window|Qt::FramelessWindowHint|Qt::CoverWindow|Qt::WindowStaysOnBottomHint);
    view->setWindowState(Qt::WindowNoState);
    view->setFocusPolicy(Qt::NoFocus);
    SetParent((HWND)view->winId(),Utils::GetWorkerW());
    view->setUrl(QUrl(QString(obj["path"].toString())));
    view->showFullScreen();
    this->show();
}


void Wallpaper::init()
{
    QFile file("config.json");
    if(!file.exists())
    {
        if(!file.open(QIODevice::WriteOnly))
        {
            qDebug() << "write json file failed";
        }else
        {
            obj.insert("path","http://10.21.40.155/worldSkillCountDown/");
            obj.insert("layout","firstButton");
            QJsonDocument document;
            document.setObject(obj);
            QByteArray byte_array = document.toJson(QJsonDocument::Compact);
            file.write(byte_array);
        }
    }

    if(file.open(QIODevice::ReadOnly))
    {
        QByteArray data = file.readAll();
        QJsonParseError e;
        QJsonDocument jsonDoc = QJsonDocument::fromJson(data,&e);
        if(e.error == QJsonParseError::NoError && !jsonDoc.isNull())
        {
            obj = jsonDoc.object();
            ui->filePath->setText(QString(obj["path"].toString()));
        }
    }
    file.close();
}

void Wallpaper::closeEvent(QCloseEvent *event)
{
    this->hide();
}


void Wallpaper::on_activatedSysTrayIcon(QSystemTrayIcon::ActivationReason reason)
{
    switch(reason){
    case QSystemTrayIcon::Trigger:
        this->show();
        break;
    case QSystemTrayIcon::DoubleClick:
        this->show();
        break;
    default:
        break;
    }
}

void Wallpaper::createActions()
{
    mShowWindow = new QAction(QObject::trUtf8("显示程序"),this);
    connect(mShowWindow,SIGNAL(triggered()),SLOT(on_showMainAction()));
    mExitAppAction = new QAction(QObject::trUtf8("退出程序"),this);
    connect(mExitAppAction,SIGNAL(triggered()),this,SLOT(on_exitAppAction()));
}


void Wallpaper::on_showMainAction()
{
    this->show();
}

void Wallpaper::on_exitAppAction()
{
    QFile file("config.json");
    if(!file.open(QIODevice::WriteOnly))
    {
        qDebug() << "write json file failed";
    }else
    {
        QJsonDocument document;
        document.setObject(obj);
        QByteArray byte_array = document.toJson(QJsonDocument::Compact);
        file.write(byte_array);
    }
    file.close();
    exit(0);
}


void Wallpaper::createMenu()
{
    mMenu = new QMenu(this);
    mMenu->addAction(mShowWindow);
    mMenu->addAction(mExitAppAction);
    mMenu->setStyleSheet("QMenu{color:black;border-bottom:1px solid #ccc;}");
    mSysTrayIcon->setContextMenu(mMenu);
}


Wallpaper::~Wallpaper()
{
    delete ui;
    delete view;
}

void Wallpaper::on_path_button_clicked()
{
   QString path = QFileDialog::getOpenFileName(this);
   ui->filePath->setText(path);
}


void Wallpaper::on_startButton_clicked()
{
    QString new_path = ui->filePath->text();
    obj["path"] = new_path;
    view->setUrl(QUrl(new_path));
}

void Wallpaper::on_fillButton_clicked()
{
    QDesktopWidget *desktop = QApplication::desktop();
    view->move(QPoint(0,0));
    int height = desktop->height();
    int width = desktop->width();
    view->resize(QSize(width,height));
}

void Wallpaper::on_secondButton_clicked()
{
    QDesktopWidget *desktop = QApplication::desktop();
    QRect size_first = desktop->screenGeometry(0);
    int width_first = size_first.width();
    view->move(QPoint(width_first,0));

    QRect size = desktop->screenGeometry(1);
    int height = size.height();
    int width = size.width();
    view->resize(QSize(width,height));
}

void Wallpaper::on_firstButton_clicked()
{
    QDesktopWidget *desktop = QApplication::desktop();
    view->move(QPoint(0,0));
    QRect size = desktop->screenGeometry(0);
    int height = size.height();
    int width = size.width();
    view->resize(QSize(width,height));
}
